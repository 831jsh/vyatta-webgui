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

#ifndef __RTRMGR_UNEXPANDED_XRL_HH__
#define __RTRMGR_UNEXPANDED_XRL_HH__


#include "libxipc/xrl_router.hh"
#include "libxipc/xrl_pf_sudp.hh"


class MasterConfigTreeNode;
class XrlAction;

//
// We want to build a queue of XRLs, but the variables needed for those
// XRLs may depend on the results from previous XRLs.  So we need to
// delay expanding them until we're actually going to send the XRL
// request.
//

class UnexpandedXrl {
public:
    UnexpandedXrl(const MasterConfigTreeNode& node, const XrlAction& action);
    ~UnexpandedXrl();

    /**
     * Expand the variables in the unexpanded XRL, and create an
     * XRL that we can actually send.
     * 
     * @param errmsg the error message (if error).
     * 
     * @return the created XRL that we can send, or NULL if error.
     */
    Xrl* expand(string& errmsg) const;

    /**
     * Return the XRL return specification as a string.
     * 
     * @return the XRL return specification.
     */
    string return_spec() const;

    string str() const;

private:
    const MasterConfigTreeNode& _node;
    const XrlAction& _action;

    // _xrl is mutable because expanding the XRL doesn't conceptually
    // change the UnexpandedXrl - storing the result here is purely an
    // optimization.
    mutable Xrl* _xrl;
};

#endif // __RTRMGR_UNEXPANDED_XRL_HH__
