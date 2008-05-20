#include <stdio.h>
#include <iostream>
#include <string>
#include "common.hh"

using namespace std;

const unsigned long WebGUI::ID_START = 2147483648;

const string WebGUI::ACTIVE_CONFIG_DIR = "/opt/vyatta/config/active";
const string WebGUI::CONFIG_TMP_DIR = "/opt/vyatta/config/tmp/tmp_";
const string WebGUI::LOCAL_CHANGES_ONLY = "/tmp/changes_only_";
const string WebGUI::LOCAL_CONFIG_DIR = "/opt/vyatta/config/tmp/new_config_";
const string WebGUI::CFG_TEMPLATE_DIR = "/opt/vyatta/share/vyatta-cfg/templates";



char const* WebGUI::ErrorDesc[8] = {"n/a",
				    "request cannot be parsed",
				    "username/password are not valid",
				    "session is not valid",
				    "general server failure",
				    "command failed",
				    "commit is in progress",
				    "configuration has changed"};


int
WebGUI::execute(std::string &cmd, std::string &stdout, bool read)
{
  int err = 0;

  string dir = "w";
  if (read == true) {
    dir = "r";
  }

  char buf[1025];
  buf[0] = '\0';

  int i = 0;
  FILE *f = popen(cmd.c_str(), dir.c_str());
  if (f) {
    //    cout << "out: " << endl;
    if (read == true) {
      fgets(buf, 1024, f);
    }
    err = pclose(f);
  }

  stdout = string(buf);
  return err;
}

/**
 *
 **/
std::string // replace all instances of victim with replacement
WebGUI::mass_replace(const std::string &source, const std::string &victim, const
	     std::string &replacement)
{
  std::string answer = source;
  std::string::size_type j = 0;
  while ((j = answer.find(victim, j)) != std::string::npos )
    answer.replace(j, victim.length(), replacement);
  return answer;
}

std::string
WebGUI::trim_whitespace(const std::string &src)
{
  string str(src);
  size_t startpos = str.find_first_not_of(" \t"); 
  size_t endpos = str.find_last_not_of(" \t"); 
  if(( string::npos == startpos ) || ( string::npos == endpos)) {
    str = "";
  }
  else {
    str = str.substr( startpos, endpos-startpos+1 );
  }
  return str;
}
