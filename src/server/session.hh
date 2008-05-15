#ifndef __SESSION_HH__
#define __SESSION_HH__

#include <string>
#include <vector>
#include "authenticate.hh"
#include "configuration.hh"
#include "command.hh"
#include "processor.hh"

class Session
{
public:
  Session(int sock, bool debug);
  
  Session(const Session &session) {
    _processor = session.processor();
    _id = session.get_id();
    _sock = session.get_sock();
    _valid = session.is_valid();
  }

  virtual ~Session() {}

  void
  init(Processor *proc);

  bool
  is_valid() const {return _valid;}

  void
  set_message(std::vector<uint8_t> &buf);

  void
  set_message(std::string &str);

  std::string
  get_message();

  bool
  process_message();

  void
  set_sock(int sock);

  int
  get_sock() const {return _sock;}

  unsigned long
  get_id() const {return 0;}

  void
  close_session() {}

  Processor*
  processor() const {return _processor;}

  void
  clear_message();

public://private:
  int _sock;
  unsigned long _time_since_last_message;
  Processor *_processor;
  Configuration _configuration;
  Authenticate _authenticate;
  Command _command;
  unsigned long _id;
  bool _valid;
  bool _debug;
};

#endif //__SESSION_HH__
