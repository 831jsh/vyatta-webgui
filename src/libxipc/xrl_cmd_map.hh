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

#ifndef __LIBXIPC_XRL_CMD_MAP_HH__
#define __LIBXIPC_XRL_CMD_MAP_HH__

#include <map>
#include <string>

#include "libxorp/callback.hh"
#include "xrl.hh"
#include "xrl_error.hh"

typedef
XorpCallback2<const XrlCmdError, const XrlArgs&, XrlArgs*>::RefPtr XrlRecvCallback;

struct XrlCmdEntry {
    XrlCmdEntry(const string& s, XrlRecvCallback cb) :
	_name(s), _cb(cb) {}

    inline const string& name() const { return _name; }

    inline const XrlCmdError
    dispatch(const XrlArgs& inputs, XrlArgs* outputs) const
    {
	return _cb->dispatch(inputs, outputs);
    }

protected:
    string		_name;
    XrlRecvCallback	_cb;
};

class XrlCmdMap {
public:
    typedef map<string, XrlCmdEntry> CmdMap;

public:
    XrlCmdMap(const string& name = "anonymous") : _name(name) {}
    virtual ~XrlCmdMap() {}

    const string& name() const { return _name; }

    virtual bool add_handler(const string& cmd, const XrlRecvCallback& rcb);

    virtual bool remove_handler (const string& name);

    const XrlCmdEntry* get_handler(const string& name) const;

    uint32_t count_handlers() const;

    const XrlCmdEntry* get_handler(uint32_t index) const;

    void get_command_names(list<string>& names) const;

    /**
     * Mark command map as finished.
     */
    virtual void finalize();

protected:
    bool add_handler (const XrlCmdEntry& c);

    XrlCmdMap(const XrlCmdMap&);		// not implemented
    XrlCmdMap& operator=(const XrlCmdMap&);	// not implemented

protected:
    const string _name;

    CmdMap _cmd_map;
};

#endif // __LIBXIPC_XRL_CMD_MAP_HH__
