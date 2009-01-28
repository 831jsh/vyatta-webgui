#ifndef __COMMAND_HH__
#define __COMMAND_HH__

#include <map>
#include <string>
#include <set>
#include "systembase.hh"
#include "processor.hh"

class MandatoryData
{
public:
  std::map< std::string,std::set<std::string> >  *_mandatory_node_coll;
  std::string _err;
  std::string _session_id;
};

class Command : public SystemBase
{
public:
  Command();
  ~Command();

  void
  execute_command(WebGUI::AccessLevel access_level);

  void
  execute_single_command(std::string &cmd, WebGUI::AccessLevel access_level, std::string &resp, int &err);

private:
  std::string
  validate_commit_nodes();

  bool
  validate_session(unsigned long id);

  bool
  multi_part_op_cmd(std::string &cmd);

  bool
  validate_op_cmd(std::string &cmd);
};
#endif //__COMMAND_HH__
