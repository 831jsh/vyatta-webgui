#include <iostream>
#include <security/pam_appl.h>
#include <security/pam_misc.h>
#include <pwd.h>
#include <sys/types.h>
#include <stdio.h>
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
  Message msg = _proc->get_msg();
  uid_t id = test_auth(msg._user, msg._pswd);

  char buf[40];
  sprintf(buf, "%d", WebGUI::AUTHENTICATION_FAILURE);
  string err_resp = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><msg>"+string(WebGUI::ErrorDesc[WebGUI::AUTHENTICATION_FAILURE])+"</msg></error></vyatta>";
  

  if (id > 0) {
    //these commands are from vyatta-cfg-cmd-wrapper script when entering config mode
    string cmd;
    char buf[20];
    string stdout;
    sprintf(buf, "%u", id);

    cmd = "mkdir -p " + WebGUI::ACTIVE_CONFIG_DIR;
    if (WebGUI::execute(cmd, stdout) != 0) {
      //syslog here
      _proc->set_response(err_resp);
      return false;
    }

    cmd = "mkdir -p " + WebGUI::LOCAL_CHANGES_ONLY + string(buf);
    if (WebGUI::execute(cmd, stdout) != 0) {
      //syslog here
      _proc->set_response(err_resp);
      return false;
    }
    //exec

    cmd = "mkdir -p " + WebGUI::LOCAL_CONFIG_DIR + string(buf);
    if (WebGUI::execute(cmd, stdout) != 0) {
      _proc->set_response(err_resp);
      return false;
    }
    //exec

    //    cmd = "grep -q union=aufs /proc/cmdline || grep -q aufs /proc/filesystems";
    string unionfs = "unionfs";
    //CRAJ@--ADD SUPPORT FOR AUSF
    /*
    if (WebGUI::execute(cmd, true)) {
      unionfs = "aufs";
    }
    */

    cmd = "sudo mount -t "+unionfs+" -o dirs="+WebGUI::LOCAL_CHANGES_ONLY+string(buf)+"=rw:"+WebGUI::ACTIVE_CONFIG_DIR+"=ro "+unionfs+" " +WebGUI::LOCAL_CONFIG_DIR+ string(buf);

    if (WebGUI::execute(cmd, stdout) != 0) {
      //syslog here
      _proc->set_response(err_resp);
      return false;
    }

    cmd = "mkdir -p " +WebGUI::CONFIG_TMP_DIR+ string(buf);
    if (WebGUI::execute(cmd, stdout) != 0) {
      //syslog here
      _proc->set_response(err_resp);
      return false;
    }

    sprintf(buf, "%d", WebGUI::SUCCESS);
    char buf1[40];
    sprintf(buf1, "%u", id);
    string tmpstr = "<?xml version='1.0' encoding='utf-8'?><vyatta><id>"+string(buf1)+"</id><error><code>"+string(buf)+"</code><msg/></error></vyatta>";
    _proc->set_response(tmpstr);
    
    //need to verify that system is set up correctly here to provide proper return code.
    _proc->_msg.set_id(id);
    return true;
  }
  _proc->set_response(err_resp);
  return false;
}

/**
 *
 **/
unsigned long Authenticate::test_auth(const std::string & username, const std::string & password) 
{
  passwd * passwd = getpwnam(username.c_str());
  if (passwd == NULL) {
    //    cerr << "failed to retreive user" << endl;
    return 0;
  }
  
  pam_conv conv = { conv_fun, const_cast<void*>((const void*)&password) };
  
  pam_handle_t *pam = NULL;
  int result = pam_start("login", passwd->pw_name, &conv, &pam);
  if (result != PAM_SUCCESS) {
    cerr << "pam_start" << endl;
    return 0;
  }
  
  result = pam_authenticate(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "failed on pam_authenticate for: " << username << ", " << password << ", " << result << endl;
    return 0;
  }
  
  result = pam_acct_mgmt(pam, 0);
  if (result != PAM_SUCCESS) {
    cerr << "pam_acct_mgmt" << endl;
    return 0;
  }
  
  result = pam_end(pam, result);
  if (result != PAM_SUCCESS) {
    cerr << "pam_end" << endl;
    return 0;
  }

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
  }

  return id;  
}

