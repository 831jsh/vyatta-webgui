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

#ifndef __RTRMGR_XRL_XORPSH_INTERFACE_HH__
#define __RTRMGR_XRL_XORPSH_INTERFACE_HH__


//#include "xrl/targets/xorpsh_base.hh"


class XorpShell;

class XrlXorpshInterface { //: public XrlXorpshTargetBase {
public:
    XrlXorpshInterface(XrlRouter* r, XorpShell& xorpsh);

    XrlCmdError common_0_1_get_target_name(
	// Output values, 
	string&	name);

    XrlCmdError common_0_1_get_version(
	// Output values, 
	string&	version);

    /**
     *  Get status from Xrl Target
     */
    XrlCmdError common_0_1_get_status(// Output values,
				      uint32_t& status,
				      string&	reason);
    
    /**
     * Shutdown cleanly
     */
    XrlCmdError common_0_1_shutdown();

    XrlCmdError rtrmgr_client_0_2_new_config_user(
	// Input values, 
	const uint32_t&	user_id);

    XrlCmdError rtrmgr_client_0_2_config_saved_done(
	// Input values,
	const bool&	success,
	const string&	errmsg);

    XrlCmdError rtrmgr_client_0_2_config_change_done(
	// Input values, 
	const bool&	success, 
	const string&	errmsg);

    XrlCmdError rtrmgr_client_0_2_config_changed(
	// Input values, 
	const uint32_t&	user_id, 
	const string&	deltas, 
	const string&	deletions);

    XrlCmdError rtrmgr_client_0_2_module_status(
	// Input values,
        const string&   modname,
        const uint32_t& status);

private:
    XorpShell&	_xorpsh;

    bool	_verbose;		// Set to true if output is verbose
};

#endif // __RTRMGR_XRL_XORPSH_INTERFACE_HH__
