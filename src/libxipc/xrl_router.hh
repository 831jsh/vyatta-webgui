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

#ifndef __LIBXIPC_XRL_ROUTER_HH__
#define __LIBXIPC_XRL_ROUTER_HH__

#include "libxorp/xorp.h"
#include "libxorp/callback.hh"

#include "xrl.hh"
#include "xrl_sender.hh"
#include "xrl_dispatcher.hh"
#include "xrl_pf.hh"
#include "finder_constants.hh"
#include "finder_client_observer.hh"


class DispatchState;

class FinderClient;
class FinderClientXrlTarget;
class FinderTcpAutoConnector;
class FinderUnixAutoConnector;
class FinderDBEntry;
class XrlRouterDispatchState;

class XrlRouter :
    public XrlDispatcher,
    public XrlSender,
    public FinderClientObserver
{
public:
    typedef XrlSender::Callback XrlCallback;
    typedef XrlRouterDispatchState DispatchState;

public:
    XrlRouter(EventLoop&	e,
	      const char*	class_name,
	      const char*	finder_address,
	      uint16_t		finder_port)
	throw (InvalidAddress);

    XrlRouter(EventLoop&	e,
	      const char*	class_name,
	      IPv4		finder_address,
	      uint16_t		finder_port)
	throw (InvalidAddress);

    XrlRouter(EventLoop&	e,
	      const char*	class_name,
	      const char*	finder_address)
	throw (InvalidAddress);

    virtual ~XrlRouter();

    /**
     * Add a protocol family listener.  When XRLs are
     * registered through XrlRouter::finalize() they will register
     * support for each protocol family listener added.
     */
    bool add_listener(XrlPFListener* listener);

    /**
     * Start registration of XRLs that have been registered via
     * add_handler with the Finder.
     */
    void finalize();

    /**
     * @return true when XRLs
     */
    inline bool finalized() const		{ return _finalized; }

    /**
     * @return true if instance has established a connection to the Finder.
     */
    bool connected() const;

    /**
     * @return true if instance has established a connection to the Finder,
     * registered own XRLs, and should be considered operational.
     */
    bool ready() const;

    /**
     * @return true if instance has experienced an unrecoverable error.
     */
    bool failed() const;

    /**
     * Send XRL.
     *
     * @param xrl XRL to be sent.
     * @param cb callback to be dispatched with XRL result and return values.
     *
     * @return true if XRL accepted for sending, false if insufficient
     * resources are available.
     */
    bool send(const Xrl& xrl, const XrlCallback& cb);

    /**
     * @return true if at least one XrlRouter::send() call is still pending
     * a result.
     */
    bool pending() const;

    /**
     * Add an XRL method handler.
     *
     * @param cmd XRL method path name.
     * @param rcb callback to be dispatched when XRL method is received for
     * invocation.
     */
    bool add_handler(const string& cmd, const XrlRecvCallback& rcb);

    /**
     * @return EventLoop used by XrlRouter instance.
     */
    inline EventLoop& eventloop()		{ return _e; }

    inline const string& instance_name() const	{ return _instance_name; }

    inline const string& class_name() const	{ return XrlCmdMap::name(); }

    string   finder_path() const;

    IPv4     finder_address() const;

    uint16_t finder_port() const;

protected:
    /**
     * Called when Finder connection is established.
     */
    virtual void finder_connect_event();

    /**
     * Called when Finder disconnect occurs.
     */
    virtual void finder_disconnect_event();

    /**
     * Called when an Xrl Target becomes visible to other processes.
     * Implementers of this method should check @ref tgt_name
     * corresponds to the @ref XrlRouter::instance_name as other
     * targets within same process may cause this method to be
     * invoked.
     *
     * Default implementation is a no-op.
     *
     * @param tgt_name name of Xrl Target becoming ready.
     */
    virtual void finder_ready_event(const string& tgt_name);

protected:
    XrlError dispatch_xrl(const string&	 method_name,
			  const XrlArgs& inputs,
			  XrlArgs&	 outputs) const;

protected:
    /**
     * Resolve callback (slow path).
     *
     * Called with results from asynchronous FinderClient Xrl queries.
     */
    void resolve_callback(const XrlError&	  e,
			  const FinderDBEntry*	  dbe,
			  XrlRouterDispatchState* ds);

    /**
     * Send callback (fast path).
     */
    void send_callback(const XrlError&	e,
		       XrlArgs*		reply,
		       XrlPFSender*	sender,
		       XrlCallback	user_callback);

    /**
     * Choose appropriate XrlPFSender and execute Xrl dispatch.
     *
     * @return true on success, false otherwise.
     */
    bool send_resolved(const Xrl&		xrl,
		       const FinderDBEntry*	dbe,
		       const XrlCallback&	dispatch_cb,
		       bool  direct_call);

    void initialize(const char* class_name,
		    IPv4	finder_addr,
		    uint16_t	finder_port);

protected:
    EventLoop&			_e;
    FinderClient*		_fc;
    FinderClientXrlTarget*	_fxt;
    FinderTcpAutoConnector*	_fac;
    FinderUnixAutoConnector*	_fac_ux;
    string			_instance_name;
    bool			_finalized;

    list<XrlPFListener*>	_listeners;		// listeners
    list<XrlRouterDispatchState*> _dsl;			// dispatch state
    list<XrlPFSender*>		_senders;		// active senders

    static uint32_t		_icnt;			// instance count
};

/**
 * Run EventLoop until an XrlRouter is ready.  If XrlRouter instance
 * fails while waiting to become ready, a warning is logged and exit()
 * is called.
 *
 * NB This method is essentially a placeholder.  A future revision to
 * the XrlRouter API is to add ServiceBase to its parent classes.
 * This will allow a richer set of event notification semantics.  For
 * the time being, wait_until_xrl_router_is_ready should be used in
 * appropriate cases to ease later refactoring.
 *
 * @param e eventloop to run.
 * @param xr xrl_router to wait for.
 */
void wait_until_xrl_router_is_ready(EventLoop& e, XrlRouter& xr);

#endif // __LIBXIPC_XRL_ROUTER_HH__
