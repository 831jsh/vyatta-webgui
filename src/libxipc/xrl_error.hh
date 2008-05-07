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

#ifndef	__LIBXIPC_XRL_ERROR_HH__
#define __LIBXIPC_XRL_ERROR_HH__

#include "libxorp/xorp.h"
#include "libxorp/c_format.hh"

using namespace std;

struct XrlErrlet;

enum XrlErrorCode {
    OKAY		  = 100,
    BAD_ARGS		  = 101,
    COMMAND_FAILED	  = 102,

    NO_FINDER		  = 200,
    RESOLVE_FAILED	  = 201,
    NO_SUCH_METHOD	  = 202,

    SEND_FAILED		  = 210,
    REPLY_TIMED_OUT	  = 211,
    SEND_FAILED_TRANSIENT = 212,

    INTERNAL_ERROR	  = 220
};

/**
 * All known error codes arising from XRL dispatches.  These include
 * underlying transport, transport location, and invocation failures.
 *
 * This class can be sub-classed to provide a sub-set of the known
 * errors, and also to append domain specific errors.
 */
class XrlError {
public:
    /**
     * The value that should be returned by functions whose execution
     * completed normally.
     */
    static const XrlError& OKAY();

    /**
     * The value that should be returned when the arguments in an XRL
     * do not match what the receiver expected.
     */
    static const XrlError& BAD_ARGS();

    /**
     * The value that should be returned when the command cannot be
     * executed by Xrl Target.
     */
    static const XrlError& COMMAND_FAILED();

    /**
     * The Xrl Finder process is not running or not ready to resolve
     * Xrl target names
     */
    static const XrlError& NO_FINDER();

    /**
     * Returned when an XRL cannot be dispatched because the target name
     * is not registered in the system.
     */
    static const XrlError& RESOLVE_FAILED();

    /**
     * Returned when the method within the XRL is not recognized by
     * the receiver.
     */
    static const XrlError& NO_SUCH_METHOD();

    /**
     * Returned when the underlying XRL transport mechanism fails.
     */
    static const XrlError& SEND_FAILED();

    /**
     * Returned when the reply is not returned within the timeout
     * period of the underlying transport mechanism.
     */
    static const XrlError& REPLY_TIMED_OUT();

    /**
     * Returned when the underlying XRL transport mechanism fails.
     */
    static const XrlError& SEND_FAILED_TRANSIENT();

    /**
     * An error has occurred within the XRL system.  This is usually a sign
     * of an implementation issue.  This error replaces no longer
     * existent errors of CORRUPT_XRL, CORRUPT_XRL_RESPONSE, and
     * BAD_PROTOCOL_VERSION.  The note associated with the error should
     * contain more information.
     */
    static const XrlError& INTERNAL_ERROR();

    /**
     * @return the unique identifer number associated with error.
     */
    XrlErrorCode error_code() const;

    /**
     * @return string containing textual description of error.
     */
    const char* error_msg() const;

    /**
     * @return string containing user annotation about source of error
     * (if set).
     */
    const string& note() const { return _note; }

    /**
     * @return string containing error_code(), error_msg(), and note().
     */
    inline string str() const {
	string r = c_format("%d ", error_code()) + error_msg();
	return note().size() ? (r + " " + note()) : (r + "\n");
    }

    /**
     * @return true if error_code corresponds to known error.
     */
    static bool known_code(uint32_t code);

    XrlError();
    XrlError(XrlErrorCode error_code, const string& note = "");
    XrlError(const XrlError& xe) : _errlet(xe._errlet), _note(xe._note) {}

    /* Strictly for classes that have access to XrlErrlet to construct
       XrlError's */
    XrlError(const XrlErrlet& x, const string& note = "") :
	_errlet(&x), _note(note) {}

    XrlError(const XrlErrlet*);

protected:
    const XrlErrlet* _errlet;
    string	     _note;
};


/**
 * Error codes for user callbacks.
 * These are a subset of @ref XrlError
 */
struct XrlCmdError {
public:
    /**
     * The default return value.  Indicates that the arguments to the
     * XRL method were correct.  Inability to perform operation should
     * still return OKAY(), but the return list should indicate the
     * error.
     */
    inline static const XrlCmdError OKAY(const string &warning = "") 
    { 
	return XrlError(XrlError::OKAY().error_code(), warning);
    }

    /**
     * Return value when the method arguments are incorrect.
     */
    inline static const XrlCmdError BAD_ARGS(const string& reason = "")
    {
	return XrlError(XrlError::BAD_ARGS().error_code(), reason);
    }

    /**
     * Return value when the method could not be execute.
     */
    inline static const XrlCmdError COMMAND_FAILED(const string& reason = "")
    {
	return XrlError(XrlError::COMMAND_FAILED().error_code(), reason);
    }

    /**
     * Convert to XrlError (needed for XRL protocol families).
     */
    operator XrlError() const { return _xrl_error; }

    /**
     * @return string containing representation of command error.
     */
    inline string str() const
    {
	return string("XrlCmdError ") + _xrl_error.str();
    }

    /**
     * @return the unique identifer number associated with error.
     */
    inline XrlErrorCode error_code() const
    {
	return _xrl_error.error_code();
    }

    /**
     * @return note associated with origin of error (i.e., the reason).
     */
    inline string note() const
    {
	return _xrl_error.note();
    }
private:
    XrlCmdError(const XrlError& xe) : _xrl_error(xe) {}
    const XrlError _xrl_error;
};


/**
 * Test for equality between a pair of XrlError instances.  The test
 * only examines the error codes associated with each instance.
 */
inline bool operator==(const XrlError& e1, const XrlError& e2)
{
    return e1.error_code() == e2.error_code();
}

/**
 * Test for inequality between a pair of XrlError instances.  The test
 * only examines the error codes associated with each instance.
 */
inline bool operator!=(const XrlError& e1, const XrlError& e2)
{
    return e1.error_code() != e2.error_code();
}

#endif // __LIBXIPC_XRL_ERROR_HH__
