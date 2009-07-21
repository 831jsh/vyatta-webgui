#include <iostream>
#include <string>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <dirent.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ldap.h>
#include <grp.h>
#include "rl_str_proc.hh"
#include "authenticate.hh"

using namespace std;

/**
 *
 **/
int conv_fun(int num_msg, const struct pam_message **msg, struct pam_response **resp, void *data) {
	*resp = (pam_response*) calloc(num_msg, sizeof(pam_response));
	if (data != NULL) {
		const string & password = *((const string*)data); 
		(*resp)->resp = x_strdup(password.c_str());
	}
	(*resp)->resp_retcode = 0;
	return PAM_SUCCESS;
}

/**
 *
 **/
Authenticate::Authenticate() : SystemBase()
{
}

/**
 *
 **/
Authenticate::~Authenticate()
{

}

/**
 *
 **/
bool
Authenticate::create_new_session()
{
  unsigned long id = 0;

  Message msg = _proc->get_msg();
  if (test_auth(msg._user, msg._pswd) == true) {
    //check for current session
    if ((id = reuse_session()) == 0) {
      id = create_new_id();
    }
  }
  else {
    _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
    return false;
  }

  if (id > 0) {
    //these commands are from vyatta-cfg-cmd-wrapper script when entering config mode
    string cmd;
    char buf[20];
    string stdout;
    sprintf(buf, "%lu", id);

    WebGUI::mkdir_p(WebGUI::ACTIVE_CONFIG_DIR.c_str());
    WebGUI::mkdir_p((WebGUI::LOCAL_CHANGES_ONLY + string(buf)).c_str());
    WebGUI::mkdir_p((WebGUI::LOCAL_CONFIG_DIR + string(buf)).c_str());

    string unionfs = WebGUI::unionfs();

    cmd = "sudo mount -t "+unionfs+" -o dirs="+WebGUI::LOCAL_CHANGES_ONLY+string(buf)+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro "+unionfs+" " +WebGUI::LOCAL_CONFIG_DIR+ string(buf);

    bool dummy;
    if (WebGUI::execute(cmd, stdout, dummy) != 0) {
      //syslog here
      _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
      return false;
    }
    
    WebGUI::mkdir_p((WebGUI::CONFIG_TMP_DIR+string(buf)).c_str());


    //apply password restriction policy here
    /*
      if the configuration shows that users or admin require non-default password
      then test for default password here, if default then set restricted bit on
      user session. Otherwise unset restricted bit.
      
      That should be enough. Note this means that an account will never be able
      to support a default password.
    */
    bool policy_pw_restricted = false;
    bool restricted = false;
    if (msg._user == "admin") {
      struct stat tmp;
      if (stat(WebGUI::OPENAPP_USER_RESTRICTED_POLICY_ADMIN.c_str(), &tmp) == 0) {
	policy_pw_restricted = true;
      }
    }
    else if (msg._user != "installer") { //then it's a user
      struct stat tmp;
      if (stat(WebGUI::OPENAPP_USER_RESTRICTED_POLICY_USER.c_str(), &tmp) == 0) {
	policy_pw_restricted = true;
      }
    }

    if (policy_pw_restricted) {
      if (msg._user == msg._pswd) {
	restricted = true;
      }
    }

    //now apply results of policy
    if (WebGUI::set_user(id, msg._user, restricted, msg._pswd) == false) {
      _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
      return false;
    }
    else if (restricted == true) {
      sprintf(buf, "%d", WebGUI::RESTRICTED_ACCESS);
      char buf1[40];
      sprintf(buf1, "%lu", id);
      string tmpstr = "<?xml version='1.0' encoding='utf-8'?><openappliance><id>"+string(buf1)+"</id><error><code>"+string(buf)+"</code><msg>change password required</msg></error></openappliance>";
      _proc->set_response(tmpstr);
      return false;
    }

    //now generate successful response
    sprintf(buf, "%d", WebGUI::SUCCESS);
    char buf1[40];
    sprintf(buf1, "%lu", id);
    string tmpstr = "<?xml version='1.0' encoding='utf-8'?><openappliance><id>"+string(buf1)+"</id><error><code>"+string(buf)+"</code><msg/></error></openappliance>";
    _proc->set_response(tmpstr);
    
    //need to verify that system is set up correctly here to provide proper return code.
    _proc->_msg.set_id(id);
    return true;
  }
  _proc->set_response(WebGUI::AUTHENTICATION_FAILURE);
  return false;
}

/**
 *
 **/
bool
Authenticate::test_grp_membership(const std::string &username,
                                  const char *gname)
{
  bool found = false;
  struct group *g = getgrnam(gname);
  if (g != NULL) {
    char **m;
    for (m = g->gr_mem; *m != (char *)0; m++) {
      if (strcmp(*m, username.c_str()) == 0) {
	found = true;
	break;
      }
    }
  }
  return found;
}

/**
 *
 **/
bool
Authenticate::test_auth(const std::string & username, const std::string & password) 
{
  passwd * passwd = getpwnam(username.c_str());
  if (passwd == NULL) {
    //    cerr << "failed to retreive user" << endl;
    return false;
  }

#define BLB_UTIL "/opt/vyatta/sbin/openapp-blb-utils.pl"
  while (username == "admin") {
    int ret = 0, tf = -1;
    char buf[256], fname[128], blb_token[32];
    snprintf(buf, 256, "%s --pass-exists --user '%s'",
             BLB_UTIL, username.c_str());
    ret = system(buf);
    if (WEXITSTATUS(ret) == 0) {
      /* admin has LDAP password. no special handling. */
      break;
    }
    snprintf(buf, 256, "%s --is-standalone", BLB_UTIL);
    ret = system(buf);
    if (WEXITSTATUS(ret) == 0) {
      /* standalone mode. should not happen. */
      break;
    }

    /* no LDAP password. do BLB assoc. */
    snprintf(fname, 128, "/tmp/cgi-blb.XXXXXX");
    tf = mkstemp(fname);
    if (tf == -1) {
      break;
    }
    fchown(tf, getuid(), -1);
    ret = 1;
    do {
      /* put user/pass in a temp file */
      FILE *auth = NULL;
      char *r = NULL;
      int e = 0;
      int slen = snprintf(buf, 256, "%s\n%s\n", username.c_str(),
                          password.c_str());
      if (slen >= 256) {
        ret = 0;
        break;
      }
      if (write(tf, buf, slen) != slen) {
        ret = 0;
        break;
      }
      close(tf);
      tf = -1;

      /* try blb auth */
      snprintf(buf, 256, "%s --auth-blb '%s'", BLB_UTIL, fname);
      if (!(auth = popen(buf, "r"))) {
        break;
      }
      r = fgets(blb_token, 32, auth);
      e = pclose(auth);
      if (r != blb_token || e == -1 || !WIFEXITED(e) || WEXITSTATUS(e) != 0) {
        break;
      }
      /* auth succeeded. blb token in blb_token. */
      /* not saving blb token here. do that in reverse proxy when user tries
       * to access blb. */

      /* now save password in LDAP */
      snprintf(buf, 256, "%s --set-pass --user '%s'", BLB_UTIL,
               username.c_str());
      if (!(auth = popen(buf, "w"))) {
        break;
      }
      slen = fprintf(auth, "%s", password.c_str());
      e = pclose(auth);
      if (slen != ((int) password.length()) || e == -1 || !WIFEXITED(e)
          || WEXITSTATUS(e) != 0) {
        break;
      }
    } while (0);
    if (tf >= 0) {
      close(tf);
    }
    unlink(fname);
    if (!ret) {
      break;
    }

    break;
  }

  ////////////////////////////////////////////////////
  /*
  //without support for op cmds fail any non vyattacfg group member
  if (!test_grp_membership(username, "vyattacfg")) {
    return false; //rejecting as failed check or non vyattacfg member
  }
  */
  /*
 
  // open appliance: group requirement
  char *be_type = getenv("VYATTA_BACKEND_TYPE");
  if (be_type && strcmp(be_type, "OA") == 0) {
    if (!test_grp_membership(username, "vmadmin")) {
      return false;
    }
  }
  */
  pam_conv conv = { conv_fun, const_cast<void*>((const void*)&password) };
  
  pam_handle_t *pam = NULL;
  int result = pam_start("login", passwd->pw_name, &conv, &pam);
  if (result != PAM_SUCCESS) {
    cerr << "pam_start" << endl;
    return false;
  }
  
  result = pam_authenticate(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "failed on pam_authenticate for: " << username << ", " << password << ", " << result << endl;
    return false;
  }
  
  result = pam_acct_mgmt(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "pam_acct_mgmt" << endl;
    return false;
  }
  
  result = pam_end(pam, result);
  if (result != PAM_SUCCESS) {
    cerr << "pam_end" << endl;
    return false;
  }
  return true;
}

/**
 *
 **/
unsigned long
Authenticate::create_new_id()
{
  struct stat tmp;
  unsigned long id = 0;
  string file;
  unsigned long val;

  FILE *fp = fopen("/dev/urandom", "r");
  if (fp) {
    char *ptr = (char*)&val;

    do {
      *ptr = fgetc(fp); if (*ptr == EOF) return 0;
      *(ptr+1) = fgetc(fp); if (*(ptr+1) == EOF) return 0;
      *(ptr+2) = fgetc(fp); if (*(ptr+2) == EOF) return 0;
      *(ptr+3) = fgetc(fp); if (*(ptr+3) == EOF) return 0;
      
      id = WebGUI::ID_START + (float(val) / float(4294967296.)) * WebGUI::ID_RANGE;
      
      //now check for collision
      char buf[40];
      sprintf(buf, "%lu", id);
      file = WebGUI::VYATTA_MODIFY_FILE + string(buf);
    }
    while (stat(file.c_str(), &tmp) == 0);

    fclose(fp);
  }
  return id;  
}

/**
 *
 **/
unsigned long
Authenticate::reuse_session()
{
  //take username and look for a match in .vyattamodify project, if found return....

  DIR *dp;
  struct dirent *dirp;
  string id_str;
  unsigned long id = 0;
  if ((dp = opendir(WebGUI::VYATTA_MODIFY_DIR.c_str())) == NULL) {
    return 0;
  }

  while ((dirp = readdir(dp)) != NULL) {
    if (strncmp(dirp->d_name, ".vyattamodify_", 14) == 0) {
      id_str = string(dirp->d_name).substr(14,24);
      id = strtoul(id_str.c_str(),NULL,10);
      if (WebGUI::get_user(id) == _proc->get_msg()._user) {
	break;
      }
      id = 0;
    }
  }
  closedir(dp);
  return id;
}

/**                                                                                                                                               
 *                                                                                                                                                
 **/
WebGUI::AccessLevel
Authenticate::get_access_level(const std::string &username)
{
  ////////////////////////////////////////////////////                                                                                            
  //Only allow users who are members of operator or vyattacfg groups to proceed                                                                   
  //get group membership via ldap...
  if (strcmp(username.c_str(), "installer") == 0) {
    //short-circuit installer access here
    return WebGUI::ACCESS_INSTALLER;
  } else {
    int ret = 0, ver = 3, flen = 0;
    LDAPMessage *res = NULL, *ent = NULL;
    LDAP *lh = NULL;
    struct berval **vals = NULL;
    WebGUI::AccessLevel rlvl = WebGUI::ACCESS_NONE;
    char *filter = NULL;

    do {
      if ((ret = ldap_initialize(&lh, "ldap://localhost")) != LDAP_SUCCESS) {
        break;
      }
      if ((ret = ldap_set_option(lh, LDAP_OPT_PROTOCOL_VERSION,
                                 (const void *) &ver)) != LDAP_OPT_SUCCESS) {
        break;
      }
      flen = 4 + username.length() + 1; /* "uid=<name>" */
      if (!(filter = (char *) malloc(flen))) {
        break;
      }
      snprintf(filter, flen, "uid=%s", username.c_str());
      ret = ldap_search_ext_s(lh, "dc=localhost,dc=localdomain",
                              LDAP_SCOPE_SUBTREE, filter,
                              NULL, 0, NULL, NULL, NULL, 0, &res);
      if (ret != LDAP_SUCCESS) {
        break;
      }
      if (!(ent = ldap_first_entry(lh, res))) {
        break;
      }
      if (!(vals = ldap_get_values_len(lh, ent, "description"))) {
        break;
      }
      {
        int vlen = vals[0]->bv_len;
        char buf[16];
        unsigned long id = _proc->_msg.id_by_val();

        if (vlen < 1 || vlen > 15) {
          break;
        }
        memcpy(buf, vals[0]->bv_val, vlen);
        buf[vlen] = 0;
        if (WebGUI::is_restricted(id)) {
          rlvl = WebGUI::ACCESS_RESTRICTED;
        } else if (strcmp(buf, "user") == 0) {
          rlvl = WebGUI::ACCESS_USER;
        } else if (strcmp(buf, "admin") == 0) {
          rlvl = WebGUI::ACCESS_ADMIN;
        }
        break;
      }
    } while (0);
    if (vals) {
      ldap_value_free_len(vals);
    }
    if (filter) {
      free(filter);
    }
    if (res) {
      ldap_msgfree(res);
    }
    if (lh) {
      ldap_unbind_ext(lh, NULL, NULL);
    }
    return rlvl;
  }
}

