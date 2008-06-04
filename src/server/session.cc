#include <time.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <iostream>
#include <unistd.h>
#include <vector>
#include <string>
#include "common.hh"
#include "processor.hh"
#include "session.hh"

using namespace std;

/**
 *
 **/
Session::Session(int sock, bool debug) : 
  _sock(sock),
  _valid(false),
  _session_timeout(30 * 60),
  _debug(debug)
{
  _processor = NULL;
}

/**
 *
 **/
void
Session::init(Processor *proc)
{
  _processor = proc;

  _authenticate.init(_processor);
  _configuration.init(_processor);
  _command.init(_processor);
}

/**
 *
 **/
void
Session::set_sock(int sock) 
{
  _sock = sock;
  if (_sock > 0) {
    _valid = true;
  }
}

/**
 *
 **/
void
Session::set_message(vector<uint8_t> &buf)
{
  _processor->set_request(buf);
}

/**
 *
 **/
void
Session::set_message(string &str)
{
  _processor->set_request(str);
}

std::string
Session::get_message() 
{
  return _processor->get_response();
}

/**
 *
 **/
bool
Session::process_message()
{
  if (_debug) {
    cout << "Session::process_message(), entering" << endl;
  }

  //parse the message, and compute the response back
  if (_processor->parse() == true) {
    if (_debug) {
      cout << "Session::process_message(), session received valid request" << endl;
    }

    Message msg = _processor->get_msg();
    switch (msg._type) {
    case WebGUI::NEWSESSION:
      if (_debug) {
	cout << "Session::process_message(): NEWSESSION" << endl;
      }
      if (_authenticate.create_new_session() == true) {
	start_session();
      }
      break;

    case WebGUI::CLICMD:
      if (_debug) {
	cout << "Session::process_message(): CLICMD" << endl;
      }

      if (!commit()) {
	return false;
      }

      if (!update_session()) {
	return false;
      }
      _command.execute_command();
      break;

    case WebGUI::GETCONFIG:
      if (_debug) {
	cout << "Session::process_message(): GETCONFIG" << endl;
      }

      if (!commit()) {
	return false;
      }

      if (!update_session()) {
	return false;
      }
      _configuration.get_config();
      break;

    case WebGUI::CLOSESESSION:
      if (_debug) {
	cout << "Session::process_message(): CLOSESESSION" << endl;
      }
      close_session();
      break;

    default:
      if (_debug) {
	cerr << "Session::process_message(): message type is unknown: " << endl;
      }
      char buf[40];
      sprintf(buf, "%d", WebGUI::MALFORMED_REQUEST);
      string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</error></vyatta>";
      _processor->set_response(err);
      return false;
    }
  }
  else {
    if (_debug) {
      cerr << "Session::process_message(): message is unknown" << endl;
    }
    char buf[40];
    sprintf(buf, "%d", WebGUI::MALFORMED_REQUEST);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::MALFORMED_REQUEST])+"</error></vyatta>";
    _processor->set_response(err);
    return false;
  }
  return true;
}

/**
 *
 **/
void
Session::clear_message()
{
  _processor->clear_message();
}

/**
 *
 **/
bool
Session::commit()
{
  string file(WebGUI::COMMIT_LOCK_FILE);
  struct stat tmp;
  if (stat(file.c_str(), &tmp) == 0) {

    char buf[40];
    sprintf(buf, "%d", WebGUI::COMMIT_IN_PROGRESS);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::COMMIT_IN_PROGRESS])+"</error></vyatta>";
    _processor->set_response(err);

    return false;
  }
  return true;
}

/**
 *
 **/
bool
Session::update_session()
{
  string stdout;
  //get timestamp from file
  string file = WebGUI::VYATTA_MODIFY_FILE + _processor->get_msg().id();

  struct stat buf;

  if (stat(file.c_str(), &buf) != 0) {
    char buf[40];
    sprintf(buf, "%d", WebGUI::SESSION_FAILURE);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::SESSION_FAILURE])+"</error></vyatta>";
    _processor->set_response(err);
    return false;
  }

  time_t t = time(NULL);

  if ((buf.st_mtime + _session_timeout) > (unsigned)t) {
    //have to clean up session at this point!!!!!!!!
    cerr << "clean up session here" << endl;

    char buf[40];
    sprintf(buf, "%d", WebGUI::SESSION_FAILURE);
    string err = "<?xml version='1.0' encoding='utf-8'?><vyatta><error><code>"+string(buf)+"</code><error>"+string(WebGUI::ErrorDesc[WebGUI::SESSION_FAILURE])+"</error></vyatta>";
    _processor->set_response(err);

    //let's ask the system to clean up at this point..

    //execute exit discard;

    //command pulled from exit discard

    string cmd("sudo umount " + WebGUI::LOCAL_CONFIG_DIR + _processor->get_msg().id());
    WebGUI::execute(cmd, stdout);
    cmd = "sudo rm -rf " + WebGUI::LOCAL_CONFIG_DIR + _processor->get_msg().id() + " " + WebGUI::LOCAL_CHANGES_ONLY + _processor->get_msg().id() + " " + WebGUI::CONFIG_TMP_DIR + _processor->get_msg().id();
    WebGUI::execute(cmd, stdout);

    return false;
  }

  string update_file = "touch " + file;

  //now touch session time mark file'
  WebGUI::execute(update_file, stdout);
  return true;
}

/**
 *
 **/
void
Session::start_session()
{
  //get timestamp from file
  string file = WebGUI::VYATTA_MODIFY_FILE + _processor->get_msg().id();

  string update_file = "touch " + file;
  //now touch session time mark file
  string stdout;
  WebGUI::execute(update_file,stdout);
}

