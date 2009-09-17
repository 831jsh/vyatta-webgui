#ifndef __AUTHENTICATE_HH__
#define __AUTHENTICATE_HH__

#include <iostream>
#include <string>
#include "systembase.hh"
#include "processor.hh"

class Authenticate : public SystemBase
{
public:
  Authenticate();
  ~Authenticate();
  
  bool
  create_new_session();

  WebGUI::AccessLevel
  get_access_level(const std::string &username);

private:
  bool
  test_grp_membership(const std::string &username, const char *gname);

  bool
  test_auth(const std::string &username, const std::string &password);

  std::string
  reuse_session();

  std::string
  create_new_id();
};

#endif //__AUTHENTICATE_HH__
