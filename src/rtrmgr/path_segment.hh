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

#ifndef __RTRMGR_PATH_SEGMENT_HH__
#define __RTRMGR_PATH_SEGMENT_HH__

class PathSegment {
public:
    PathSegment(const string& segname, bool is_tag) 
	: _is_tag(is_tag), _segname(segname) {}

    bool is_tag() const { return _is_tag; }
    const string& segname() const { return _segname; }

private:
    bool	_is_tag;
    string	_segname;
};

#endif // __RTRMGR_PATH_SEGMENT_HH__
