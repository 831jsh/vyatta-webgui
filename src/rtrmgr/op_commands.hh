// -*- c-basic-offset: 4; tab-width: 8; indent-tabs-mode: t -*-

// Copyright (c) 2001-2007 International Computer Science Institute
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software")
// to deal in the Software without restriction, subject to the conditions
// listed in the XORP LICENSE file. These conditions include: you must
// preserve this copyright notice, and you cannot mention the copyright
// holders in advertising related to the Software without their permission.
// The Software is provided WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED. This
// notice is a summary of the XORP LICENSE file; the license in that file is
// legally binding.

// $XORP$

#ifndef __RTRMGR_OP_COMMAND_HH__
#define __RTRMGR_OP_COMMAND_HH__


#include <list>
#include <set>

#include "libxorp/asyncio.hh"

#include "cli.hh"
#include "rtrmgr_error.hh"


class ConfigTree;
class OpCommand;
class RunCommand;
class TemplateTree;
class SlaveModuleManager;

class OpInstance {
public:
    OpInstance(EventLoop&			eventloop,
	       OpCommand&			op_command,
	       const string&			executable_filename,
	       const list<string>&		command_argument_list,
	       RouterCLI::OpModePrintCallback	print_cb,
	       RouterCLI::OpModeDoneCallback	done_cb);
    ~OpInstance();

    /**
     * Terminate the instance.
     */
    void terminate();

    /**
     * Terminate the instance with prejudice.
     */
    void terminate_with_prejudice();

private:
    OpInstance(const OpInstance&);		// Not implemented
    OpInstance& operator=(const OpInstance&);	// Not implemented

    void stdout_cb(RunCommand* run_command, const string& output);
    void stderr_cb(RunCommand* run_command, const string& output);
    void done_cb(RunCommand* run_command, bool success,
		 const string& error_msg);
    void execute_done(bool success);

    EventLoop&		_eventloop;
    OpCommand&		_op_command;
    string		_executable_filename;
    list<string>	_command_argument_list;

    RunCommand*		_run_command;
    string		_error_msg;

    RouterCLI::OpModePrintCallback	_print_cb;
    RouterCLI::OpModeDoneCallback	_done_cb;
};

class OpCommand {
public:
    OpCommand(OpCommandList& ocl, const list<string>& command_parts);

    const list<string>& command_parts() const { return _command_parts; }
    const string& command_name() const { return _command_name; }
    const string& help_string() const { return _help_string; }
    const string& module() const { return _module; }
    const string& command_action() const { return _command_action; }
    void set_help_string(const string& v) { _help_string = v; }
    void set_module(const string& v) { _module = v; }
    void set_command_action(const string& v) { _command_action = v; }
    void set_command_action_filename(const string& v) { _command_action_filename = v; }
    void set_command_action_argument_list(const list<string>& v) { _command_action_argument_list = v; }
    void set_command_executable_filename(const string& v) { _command_executable_filename = v; }
    bool is_executable() const { return (! _command_action.empty()); }
    bool can_pipe() const { return is_executable(); }

    /**
     * Test if "no-more" (i.e., unpaged) is the default output mode.
     *
     * @return true if "no-more" (i.e., unpaged) is the default output mode,
     * otherwise false.
     */
    bool default_nomore_mode() const { return (_default_nomore_mode); }

    /**
     * Set the default paging mode.
     *
     * @param v if true, then "no-more" (i.e., unpaged) is the default
     * output mode.
     */
    void set_default_nomore_mode(bool v) { _default_nomore_mode = v; }

    /**
     * Test if "no-more" (i.e., unpaged) is the default output mode.
     *
     * @return true if "no-more" (i.e., unpaged) is the default output mode,
     * otherwise false.
     */
    bool default_confirm_mode() const { return (_default_confirm_mode); }

    /**
     * Set the default paging mode.
     *
     * @param v if true, then "no-more" (i.e., unpaged) is the default
     * output mode.
     */
    void set_default_confirm_mode(bool v) { _default_confirm_mode = v; }

    void add_opt_param(const string& opt_param, const string& opt_param_help);
    bool has_opt_param(const string& opt_param) const;
    string str() const;
    static string command_parts2command_name(const list<string>& command_parts);

    /**
     * Select a positional argument.
     *
     * @param argument_list the list with the arguments.
     * @param position the positional argument (e.g., "$0" specifies all
     * arguments, "$1" is the first argument, "$2" the second argument, etc.)
     * @param error_msg the error message (if error).
     * @return if @ref position is valid, then a list with the the strings
     * with the selected arguments, or an empty string if an error.
     * Note that only if the position argument is "$0", then the list
     * will contain more than one elements.
     */
    static list<string> select_positional_argument(
	const list<string>& argument_list,
	const string& position,
	string& error_msg);

    /**
     * Execute an operational mode command.
     *
     * @param eventloop the event loop.
     * @param command_line the list with the command to execute and the
     * arguments.
     * @param print_cb callback to be invoked with output from command.
     * @param done_cb callback to invoke when the command terminates.
     *
     * @return a pointer to the command instance on success.
     */
    OpInstance* execute(EventLoop& eventloop,
			const list<string>& command_line,
			RouterCLI::OpModePrintCallback print_cb,
			RouterCLI::OpModeDoneCallback done_cb);

    bool command_match(const list<string>& path_parts,
		       SlaveConfigTree* sct, bool exact_match) const;
    void get_matches(size_t wordnum, SlaveConfigTree* sct,
		     map<string, CliCommandMatch>& return_matches) const;
    bool type_match(const string& s, string& errmsg) const;
    void add_instance(OpInstance* instance);
    void remove_instance(OpInstance* instance);

    bool is_invalid() const { return (_is_invalid); }
    void set_is_invalid(bool v) { _is_invalid = v; }

private:
    OpCommandList&	_ocl;
    list<string>	_command_parts;
    string		_command_name;
    string		_help_string;
    string		_module;
    string		_command_action;
    string		_command_action_filename;
    list<string>	_command_action_argument_list;
    string		_command_executable_filename;
    map<string, string>	_opt_params;	// Optional parameters and the CLI help
    set<OpInstance*>	_instances;
    bool		_is_invalid;	// If true, this command is invalid
    bool		_default_nomore_mode; // True if "no-more" (i.e., unpaged) mode is default
    bool                _default_confirm_mode; //True if "confim" flag is set otherwise normal mode
};

class OpCommandList {
public:
    OpCommandList(const TemplateTree* tt, SlaveModuleManager& mmgr);
    OpCommandList(const string& config_template_dir, const TemplateTree* tt,
		  SlaveModuleManager& mmgr) throw (InitError);
    ~OpCommandList();

    bool done() const;
    void incr_running_op_instances_n();
    void decr_running_op_instances_n();

    int read_templates(const string& config_template_dir, string& errmsg);
    void set_slave_config_tree(SlaveConfigTree* sct) { _slave_config_tree = sct; }
    bool check_variable_name(const string& variable_name) const;
    OpCommand* find_op_command(const list<string>& command_parts);
    OpCommand* add_op_command(const OpCommand& op_command);
    bool command_match(const list<string>& command_parts,
		       bool exact_match) const;
    OpInstance *execute(EventLoop& eventloop,
			const list<string>& command_parts,
			RouterCLI::OpModePrintCallback print_cb,
			RouterCLI::OpModeDoneCallback done_cb) const;
    map<string, CliCommandMatch> top_level_commands() const;
    map<string, CliCommandMatch> childlist(const vector<string>& vector_path) const;

    list<OpCommand*>& op_commands() { return _op_commands; }

private:
    list<OpCommand*>	_op_commands;
    size_t		_running_op_instances_n;

    // Below here is temporary storage for use in parsing
    list<string>	_path_segments;
    OpCommand*		_current_command;
    const TemplateTree*	_template_tree;
    SlaveConfigTree*	_slave_config_tree;
    SlaveModuleManager& _mmgr;
};

#endif // __RTRMGR_OP_COMMAND_HH__
