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

#include "nyiexcept.hh"
#include "xrl_std_router.hh"
//#include "xrl_pf_inproc.hh"
//#include "xrl_pf_stcp.hh"
#include "xrl_pf_sudp.hh"
//#include "xrl_pf_sunix.hh"

// ----------------------------------------------------------------------------
// Helper methods

static XrlPFListener*
create_listener(EventLoop& e, XrlDispatcher* d)
{
    const char* pf = getenv("XORP_PF");
    if (pf != NULL) {
	if (pf[0] == 'i') {

NYIEXCEPT;
//	    return new XrlPFInProcListener(e, d);
	}
	if (pf[0] == 'u') {

NYIEXCEPT;
//	    return new XrlPFSUDPListener(e, d);
	}
	if (pf[0] == 'x') {

NYIEXCEPT;
//	    return new XrlPFSUnixListener(e, d);
	}
    }

NYIEXCEPT;
//    return new XrlPFSTCPListener(e, d);
}

static void
destroy_listener(XrlPFListener*& l)
{
    delete l;
    l = 0;
}

// ----------------------------------------------------------------------------
// XrlStdRouter implementation

XrlStdRouter::XrlStdRouter(EventLoop&	eventloop,
			   const char*	class_name)
    : XrlRouter(eventloop, class_name,  FinderConstants::FINDER_DEFAULT_HOST(),
		FinderConstants::FINDER_DEFAULT_PORT())
{
    _l = create_listener(eventloop, this);
    add_listener(_l);
}

XrlStdRouter::XrlStdRouter(EventLoop&	eventloop,
			   const char*	class_name,
			   IPv4		finder_address)
    : XrlRouter(eventloop, class_name, finder_address,
		FinderConstants::FINDER_DEFAULT_PORT())
{
    _l = create_listener(eventloop, this);
    add_listener(_l);
}

XrlStdRouter::XrlStdRouter(EventLoop&	eventloop,
			   const char*	class_name,
			   IPv4		finder_address,
			   uint16_t	finder_port)
    : XrlRouter(eventloop, class_name, finder_address, finder_port)
{
    _l = create_listener(eventloop, this);
    add_listener(_l);
}

XrlStdRouter::XrlStdRouter(EventLoop&	eventloop,
			   const char*	class_name,
			   const char*	finder_address)
    : XrlRouter(eventloop, class_name, finder_address,
		FinderConstants::FINDER_DEFAULT_PORT())
{
    _l = create_listener(eventloop, this);
    add_listener(_l);
}

XrlStdRouter::XrlStdRouter(EventLoop&	eventloop,
			   const char*	class_name,
			   const char*	finder_address,
			   uint16_t	finder_port)
    : XrlRouter(eventloop, class_name, finder_address, finder_port)
{
    _l = create_listener(eventloop, this);
    add_listener(_l);
}

XrlStdRouter::~XrlStdRouter()
{
    // remove_listener(&_l);
    destroy_listener(_l);
}

