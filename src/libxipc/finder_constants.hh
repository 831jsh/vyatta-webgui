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

#ifndef __LIBXIPC_FINDER_CONSTANTS_HH__
#define __LIBXIPC_FINDER_CONSTANTS_HH__

class FinderConstants {
public:
    static uint16_t FINDER_DEFAULT_PORT()	{ return (19999); }
    static const IPv4 FINDER_DEFAULT_HOST()	{ return IPv4::LOOPBACK(); }
    static const char* FINDER_DEFAULT_PATH()	{ return "finder.sock"; }
};

#endif // __LIBXIPC_FINDER_CONSTANTS_HH__
