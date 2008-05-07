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

#ident "$XORP$"

#include "xrl_module.h"
#include "libxorp/debug.h"
#include "xrl.hh"
#include "xrl_tokens.hh"

const string Xrl::_finder_protocol = "finder";

const char*
Xrl::parse_xrl_path(const char* c_str)
{
    const char *sep, *start;

    // Extract protocol
    start = c_str;
    sep = strstr(start, XrlToken::PROTO_TGT_SEP);
    if (0 == sep) {
	// Not found, assume finder protocol
	_protocol = _finder_protocol;
    } else {
	_protocol = string(start, sep - start);
	start = sep + TOKEN_BYTES(XrlToken::PROTO_TGT_SEP) - 1;
    }

    // Extract Target
    sep = strstr(start, XrlToken::TGT_CMD_SEP);
    if (0 == sep)
	xorp_throw0(InvalidString);
    _target = string(start, sep - start);
    start = sep + TOKEN_BYTES(XrlToken::TGT_CMD_SEP) - 1;

    // Extract Command
    sep = strstr(start, XrlToken::CMD_ARGS_SEP);
    if (sep == 0) {
	_command = string(start);
	if (_command.size() == 0) {
	    xorp_throw0(InvalidString);
	}
	return 0;
    }
    _command = string(start, sep - start);
    start = sep + TOKEN_BYTES(XrlToken::CMD_ARGS_SEP) - 1;

    return start;
}

Xrl::Xrl(const char* c_str) throw (InvalidString)
{
    if (0 == c_str)
	xorp_throw0(InvalidString);

    const char* start = parse_xrl_path(c_str);

    // Extract Arguments and pass to XrlArgs string constructor
    if (0 != start && *start != '\0') {
	try {
	    _args = XrlArgs(start);
	} catch (const InvalidString& is) {
	    debug_msg("Failed to restore xrl args:\n\t\"%s\"", start);
	    throw is;
	}
    }
}

Xrl::~Xrl()
{
}

string
Xrl::str() const
{
    string s = string_no_args();
    if (_args.size()) {
	return s + string(XrlToken::CMD_ARGS_SEP) + _args.str();
    }
    return s;
}

string
Xrl::str_filter(const string &match) const
{
    string s = string_no_args();
    if (_args.size()) {
	if (_args.str().find(match) != string::npos) {
	    //if we find the match string return without any args
	    return s;
	}
	return s + string(XrlToken::CMD_ARGS_SEP) + _args.str();
    }
    return s;
}

bool
Xrl::operator==(const Xrl& x) const
{
    return ((x._protocol == _protocol) && (x._target == _target) &&
	    (x._command == _command) && (x.args() == args()));
}

bool
Xrl::is_resolved() const
{
    // This value is ripe for caching.
    return strcasecmp(_protocol.c_str(), _finder_protocol.c_str());
}

size_t
Xrl::packed_bytes() const
{
    // Use XrlAtom packing as it's well tested.  Push Xrl path
    // components to front of args list, compute packed size, then pop
    // it off again.
    XrlAtom xa(this->string_no_args());
    _args.push_front(xa);
    size_t packed_bytes = _args.packed_bytes();
    _args.pop_front();
    return packed_bytes;
}

size_t
Xrl::pack(uint8_t* buffer, size_t buffer_bytes) const
{
    // See comment in packed_bytes() for an explanation.
    XrlAtom xa(this->string_no_args());
    _args.push_front(xa);
    size_t packed_bytes = _args.pack(buffer, buffer_bytes);
    _args.pop_front();
    return packed_bytes;
}

size_t
Xrl::unpack(const uint8_t* buffer, size_t buffer_bytes)
{
    _args.clear();

    size_t unpacked_bytes = _args.unpack(buffer, buffer_bytes);
    if (unpacked_bytes == 0)
	return 0;

    const XrlAtom& xa = _args.front();
    if (xa.type() != xrlatom_text || xa.has_data() == false) {
	_args.pop_front();
	return 0;
    }

    parse_xrl_path(xa.text().c_str());
    _args.pop_front();

    return unpacked_bytes;
}
