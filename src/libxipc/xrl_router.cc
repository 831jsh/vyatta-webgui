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
#include "libxorp/callback.hh"
#include "libxorp/xlog.h"

//#include "hmac_md5.h"
#include "xrl_error.hh"
#include "xrl_router.hh"
#include "xrl_pf.hh"
//#include "xrl_pf_factory.hh"

//#include "finder_client.hh"
//#include "finder_client_xrl_target.hh"
//#include "finder_tcp_messenger.hh"
//#include "finder_unix_messenger.hh"

//#include "sockutil.hh"

//
// Enable this macro to enable Xrl callback checker that checks each Xrl
// callback is dispatched just once.
//
// #define USE_XRL_CALLBACK_CHECKER


// ----------------------------------------------------------------------------
// Xrl Tracing central

static class TraceXrl {
public:
    TraceXrl() {
	_do_trace = !(getenv("XRLTRACE") == 0);
    }
    inline bool on() const { return _do_trace; }
    operator bool() { return _do_trace; }

protected:
    bool _do_trace;
} xrl_trace;

#define trace_xrl(p, x) 						      \
do {									      \
    if (xrl_trace.on()) XLOG_INFO("%s", string((p) + (x).str()).c_str());     \
} while (0)


/**
 * Slow-path dispatch state.  Contains information that needs to be held
 * whilst waiting for a finder resolution.
 */
struct XrlRouterDispatchState
{
public:
    typedef XrlRouter::XrlCallback XrlCallback;

public:
    XrlRouterDispatchState(const Xrl&		x,
			   const XrlCallback&	xcb)
	: _xrl(x), _xcb(xcb)
    {}

    inline const Xrl& xrl() const		{ return _xrl; }
    inline XrlCallback& cb()			{ return _xcb; }

protected:
    Xrl				_xrl;
    XrlRouter::XrlCallback	_xcb;
};


//
// This is scatty and temporary
//
static IPv4
finder_host(const char* host)
    throw (InvalidAddress)
{
    in_addr ia;

throw std::logic_error("NYI");
//    if (address_lookup(host, ia) == false) {
//	xorp_throw(InvalidAddress,
//		   c_format("Could resolve finder host %s\n", host));
//    }
//    return IPv4(ia);
}

static string
mk_instance_name(EventLoop& e, const char* classname)
{
    static uint32_t sp = (uint32_t)getpid();

throw std::logic_error("NYI");
//    static uint32_t sa = get_preferred_ipv4_addr().s_addr;
//    static uint32_t sc;
//
//    TimeVal now;
//    e.current_time(now);
//    sc++;
//
//    uint32_t data[5];
//    data[0] = sa;
//    data[1] = sp;
//    data[2] = sc;
//    data[3] = now.sec();
//    data[4] = now.usec();
//
//    const char* key = "hubble bubble toil and trouble";
//    uint8_t digest[16];
//    hmac_md5(reinterpret_cast<const uint8_t*>(data), sizeof(data),
//	     reinterpret_cast<const uint8_t*>(key), sizeof(key), digest);
//
//    char asc_digest[33];
//    if (hmac_md5_digest_to_ascii(digest, asc_digest, sizeof(asc_digest)) == 0)
//	XLOG_FATAL("Could not make ascii md5 digest representation");
//
//    return c_format("%s-%s@", classname, asc_digest) + IPv4(sa).str();
}

// ----------------------------------------------------------------------------
// Debug code (check callbacks only invoked once)




// ----------------------------------------------------------------------------
// XrlRouter code

static const uint32_t DEFAULT_FINDER_CONNECT_TIMEOUT_MS = 30 * 1000;

uint32_t XrlRouter::_icnt = 0;

void
XrlRouter::initialize(const char* class_name,
		      IPv4	  finder_addr,
		      uint16_t	  finder_port)
{
    char* value;

    // Set the finder client address from the environment variable if it is set
    value = getenv("XORP_FINDER_CLIENT_ADDRESS");
    if (value != NULL) {
	try {
	    struct in_addr addr;
	    IPv4 ipv4(value);
	    ipv4.copy_out(addr);

throw std::logic_error("NYI");
//	    if (set_preferred_ipv4_addr(addr) != true) {
//		XLOG_ERROR("Failed to change the Finder client address to %s",
//			   ipv4.str().c_str());
//	    }
	} catch (const InvalidString& e) {

throw std::logic_error("NYI");
//	    XLOG_ERROR("Invalid \"XORP_FINDER_CLIENT_ADDRESS\": %s",
//		       e.str().c_str());
	}
    }

    // Set the finder server address from the environment variable if it is set
    value = getenv("XORP_FINDER_SERVER_ADDRESS");
    if (value != NULL) {
	try {
	    IPv4 ipv4(value);
	    if (! ipv4.is_unicast()) {

throw std::logic_error("NYI");
//		XLOG_ERROR("Failed to change the Finder server address to %s",
//			   ipv4.str().c_str());
	    } else {
		finder_addr = ipv4;
	    }
	} catch (const InvalidString& e) {

throw std::logic_error("NYI");
//	    XLOG_ERROR("Invalid \"XORP_FINDER_SERVER_ADDRESS\": %s",
//		       e.str().c_str());
	}
    }

    // Set the finder server port from the environment variable if it is set
    value = getenv("XORP_FINDER_SERVER_PORT");
    if (value != NULL) {
	int port = atoi(value);
	if (port <= 0 || port > 65535) {

throw std::logic_error("NYI");
//	    XLOG_ERROR("Invalid \"XORP_FINDER_SERVER_PORT\": %s", value);
	} else {
	    finder_port = port;
	}
    }

    // Set the finder connect timeout from environment variable if it is set.
    uint32_t timeout_ms = DEFAULT_FINDER_CONNECT_TIMEOUT_MS;
    value = getenv("XORP_FINDER_CONNECT_TIMEOUT_MS");
    if (value != NULL) {
	char *ep = NULL;
	timeout_ms = strtoul(value, &ep, 10);
	if ( !(*value != '\0' && *ep == '\0') &&
	      (timeout_ms <= 0 || timeout_ms > 6000)) {

throw std::logic_error("NYI");
//	    XLOG_ERROR("Invalid \"XORP_FINDER_CONNECT_TIMEOUT_MS\": %s", value);
//	    timeout_ms = DEFAULT_FINDER_CONNECT_TIMEOUT_MS;
	}
    }

throw std::logic_error("NYI");
//    _fc = new FinderClient();
//
//    _fxt = new FinderClientXrlTarget(_fc, &_fc->commands());
//
//    if (finder_addr == IPv4::LOOPBACK()) {
//	_fac_ux = new FinderUnixAutoConnector(_e, *_fc, _fc->commands(),
//				      FinderConstants::FINDER_DEFAULT_PATH(),
//				      true, timeout_ms);
//	_fac = 0;
//    }
//    else {
//	_fac = new FinderTcpAutoConnector(_e, *_fc, _fc->commands(),
//				      finder_addr, finder_port,
//				      true, timeout_ms);
//	_fac_ux = 0;
//    }
//
//    _instance_name = mk_instance_name(_e, class_name);
//
//    _fc->attach_observer(this);
//    if (_fc->register_xrl_target(_instance_name, class_name, this) == false) {
//	XLOG_FATAL("Failed to register target %s\n", class_name);
//    }
//
//    if (_icnt == 0)
//	XrlPFSenderFactory::startup();
//    _icnt++;
}

XrlRouter::XrlRouter(EventLoop&  e,
		     const char* class_name,
		     const char* finder_addr,
		     uint16_t	 finder_port)
    throw (InvalidAddress)
    : XrlDispatcher(class_name), _e(e), _finalized(false)
{
    IPv4 finder_ip;
    if (0 == finder_addr) {
	finder_ip = FinderConstants::FINDER_DEFAULT_HOST();
    } else if (strncmp(finder_addr, FinderConstants::FINDER_DEFAULT_PATH(),
	strlen(FinderConstants::FINDER_DEFAULT_PATH())) == 0) {
	finder_ip = IPv4::LOOPBACK();
    } else {
	finder_ip = finder_host(finder_addr);
    }

    if (0 == finder_port)
	finder_port = FinderConstants::FINDER_DEFAULT_PORT();

    initialize(class_name, finder_ip, finder_port);
}

XrlRouter::XrlRouter(EventLoop&  e,
		     const char* class_name,
		     IPv4 	 finder_ip,
		     uint16_t	 finder_port)
    throw (InvalidAddress)
    : XrlDispatcher(class_name), _e(e), _finalized(false)
{
    if (0 == finder_port)
	finder_port = FinderConstants::FINDER_DEFAULT_PORT();

    initialize(class_name, finder_ip, finder_port);
}

XrlRouter::XrlRouter(EventLoop&  e,
		     const char* class_name,
		     const char* finder_addr)
    throw (InvalidAddress)
    : XrlDispatcher(class_name), _e(e), _finalized(false)
{
    IPv4 finder_ip;
    if (0 == finder_addr) {
	finder_ip = FinderConstants::FINDER_DEFAULT_HOST();
    } else if (strncmp(finder_addr, FinderConstants::FINDER_DEFAULT_PATH(),
	strlen(FinderConstants::FINDER_DEFAULT_PATH()))) {
	finder_ip = IPv4::LOOPBACK();
    } else {
	finder_ip = finder_host(finder_addr);
    }

    initialize(class_name, finder_ip, FinderConstants::FINDER_DEFAULT_PORT());
}

XrlRouter::~XrlRouter()
{

throw std::logic_error("NYI");
//    _fc->detach_observer(this);
//    if (_fac != 0)
//	_fac->set_enabled(false);
//    else if (_fac_ux)
//	_fac_ux->set_enabled(false);
//
//    while (_senders.empty() == false) {
//	XrlPFSenderFactory::destroy_sender(_senders.front());
//	_senders.pop_front();
//    }
//
//    while (_dsl.empty() == false) {
//	delete _dsl.front();
//	_dsl.pop_front();
//    }
//
//    if (_fac != 0)
//	delete _fac;
//    else if (_fac_ux)
//	delete _fac_ux;
//
//    delete _fxt;
//    delete _fc;
//    _icnt--;
//    if (_icnt == 0)
//	XrlPFSenderFactory::shutdown();
//
}

bool
XrlRouter::connected() const
{
throw std::logic_error("NYI");
//    return _fc && _fc->connected();
}

bool
XrlRouter::ready() const
{

throw std::logic_error("NYI");
//    return _fc && _fc->ready();
}

bool
XrlRouter::failed() const
{
    if (_fac != 0)
throw std::logic_error("NYI");
//	return _fac->enabled() == false && ready() == false;
    else if (_fac_ux)
throw std::logic_error("NYI");
//	return _fac_ux->enabled() == false && ready() == false;

    return true;
}

bool
XrlRouter::pending() const
{
    list<XrlPFListener*>::const_iterator ci;
    for (ci = _listeners.begin(); ci != _listeners.end(); ++ci) {
	XrlPFListener* l = *ci;
	if (l->response_pending())
	    return true;
    }

    return _senders.empty() == false && _dsl.empty() == false;
}

bool
XrlRouter::add_listener(XrlPFListener* l)
{
    _listeners.push_back(l);
    l->set_dispatcher(this);

    return true;
}

void
XrlRouter::finalize()
{
    list<XrlPFListener*>::iterator li = _listeners.begin();
    while (li != _listeners.end()) {
	const XrlPFListener* l = *li;
	// Walk list of Xrl in command map and register them with finder client
	XrlCmdMap::CmdMap::const_iterator ci = _cmd_map.begin();
	while (ci != _cmd_map.end()) {
	    Xrl x("finder", _instance_name, ci->first);
	    debug_msg("adding handler for %s protocol %s address %s\n",
		      x.str().c_str(), l->protocol(), l->address());

throw std::logic_error("NYI");
//	    _fc->register_xrl(instance_name(), x.str(),
//			      l->protocol(), l->address());
//	    ++ci;
	}
	++li;
    }

throw std::logic_error("NYI");
//    _fc->enable_xrls(instance_name());
//    _finalized = true;
}

bool
XrlRouter::add_handler(const string& cmd, const XrlRecvCallback& rcb)
{
    if (finalized()) {
throw std::logic_error("NYI");
//	XLOG_ERROR("Attempting to add handler after XrlRouter finalized.  Handler = \"%s\"", cmd.c_str());
//	return false;
    }

    return XrlCmdMap::add_handler(cmd, rcb);
}

void
XrlRouter::send_callback(const XrlError& e,
			 XrlArgs*	 reply,
			 XrlPFSender*	 /* s */,
			 XrlCallback	 user_callback)
{
    user_callback->dispatch(e, reply);
}

bool
XrlRouter::send_resolved(const Xrl&		xrl,
			 const FinderDBEntry*	dbe,
			 const XrlCallback&	cb,
			 bool  direct_call)
{
    try {

throw std::logic_error("NYI");
//	Xrl x(dbe->values().front().c_str());
//
//	XrlPFSender* s = 0;
//	list<XrlPFSender*>::iterator i;
//	for (i = _senders.begin(); i != _senders.end(); ++i) {
//	    s = *i;
//
//	    if (s->protocol() != x.protocol() || s->address()  != x.target()) {
//		continue;
//	    }
//
//	    if (s->alive()) {
//		goto __got_sender;
//	    }
//
//	    XLOG_INFO("Sender died (protocol = \"%s\", address = \"%s\")",
//		      s->protocol(), s->address().c_str());
//	    XrlPFSenderFactory::destroy_sender(s);
//	    _senders.erase(i);
//	    break;
//	}
//
//	s = XrlPFSenderFactory::create_sender(_e, x.protocol().c_str(),
//					      x.target().c_str());
//	if (s == 0) {
//	    XLOG_ERROR("Could not create XrlPFSender for protocol = \"%s\" "
//		       "address = \"%s\" ",
//		       x.protocol().c_str(), x.target().c_str());
//
//	    // Notify Finder client that result was bad.
//	    _fc->uncache_result(dbe);
//
//	    // Coerce finder client to check with Finder.
//	    return send(xrl, cb);
//	}
//	XLOG_ASSERT(s->protocol() == x.protocol());
//	XLOG_ASSERT(s->address()  == x.target());
//	_senders.push_back(s);
//
//    __got_sender:
//	Xrl tmp(xrl);
//	x.args().swap(tmp.args());
//	if (s) {
//	    trace_xrl("Sending ", x);
//	    return s->send(x, direct_call,
//			   callback(this, &XrlRouter::send_callback, s, cb));
//	}
//	cb->dispatch(XrlError(SEND_FAILED, "sender not instantiated"), 0);
    } catch (const InvalidString&) {
	cb->dispatch(XrlError(INTERNAL_ERROR, "bad factory arguments"), 0);
    }
    return false;
}

void
XrlRouter::resolve_callback(const XrlError&	 	e,
			    const FinderDBEntry*	dbe,
			    XrlRouterDispatchState*	ds)
{
    list<XrlRouterDispatchState*>::iterator i;
    i = find(_dsl.begin(), _dsl.end(), ds);
    XLOG_ASSERT(i == _dsl.begin());
    _dsl.erase(i);

    if (e == XrlError::OKAY()) {
	if (send_resolved(ds->xrl(), dbe, ds->cb(), false) == false) {
	    // We tried to force sender to send xrl and it declined the
	    // opportunity.  This should only happen when it's out of buffer
	    // space
	    ds->cb()->dispatch(XrlError::SEND_FAILED_TRANSIENT(), 0);
	}
    } else {
	ds->cb()->dispatch(e, 0);
    }
    delete ds;

    return;
}

#ifdef USE_XRL_CALLBACK_CHECKER

/**
 * @short Class to maonitor Xrl callbacks.
 *
 * At present this class just checks that each XrlCallback is executed
 * just once.
 */
static class
XrlCallbackChecker
{
public:
    typedef XrlRouter::XrlCallback XrlCallback;

public:
    XrlCallbackChecker()
	: _seqno(0)
    {}

    void process_callback(const XrlError& e, XrlArgs* a, uint32_t seqno)
    {
	map<uint32_t, XrlCallback>::iterator i = _cbs.find(seqno);
	XLOG_ASSERT(i != _cbs.end());
	XrlCallback ucb = i->second;
	_cbs.erase(i);
	if (e != XrlError::OKAY()) {
	    fprintf(stderr, "Seqno %u Failed %s\n",
		    seqno, e.str().c_str());
	}
	ucb->dispatch(e, a);
    }

    XrlCallback add_callback(const XrlCallback& ucb)
    {
	_cbs[_seqno] = ucb;
	return callback(this, &XrlCallbackChecker::process_callback, _seqno++);
    }

    uint32_t last_seqno() const { return _seqno - 1; }

protected:
    map<uint32_t, XrlCallback> _cbs;
    uint32_t _seqno;
} cb_checker;

#endif

bool
XrlRouter::send(const Xrl& xrl, const XrlCallback& user_cb)
{
throw std::logic_error("NYI");

//  trace_xrl("Resolving xrl:", xrl);
//
//    if (_fc->connected() == false) {
//#if	0
// 	user_cb->dispatch(XrlError::NO_FINDER(), 0);
//#endif
//	XLOG_ERROR("NO FINDER");
//	return false;
//    }
//
//#ifdef USE_XRL_CALLBACK_CHECKER
//    // Callback checker wrappers user callback with callback that
//    // performs completion checking operation and then dispatches the
//    // users callback.
//    XrlCallback xcb = cb_checker.add_callback(user_cb);
//#else
//    const XrlCallback& xcb = user_cb;
//#endif
//
//    //
//    // Finder directed Xrl - takes custom path through FinderClient.
//    //
//    if (xrl.protocol() == "finder" && xrl.target().substr(0,6) == "finder") {
//	if (_fc->forward_finder_xrl(xrl, xcb)) {
//	    return true;
//	}
//#if	0
//#ifdef USE_XRL_CALLBACK_CHECKER
//	cb_checker.process_callback(XrlError::NO_FINDER(), 0,
//				    cb_checker.last_seqno());
//#else
// 	user_cb->dispatch(XrlError::NO_FINDER(), 0);
//#endif
//#endif
//	XLOG_ERROR("NO FINDER");
//	return false;
//    }
//
//#if 0
//    // XXX This stops us getting stuck with everything queued up on
//    // finder client responses.  It's likely to be a cause of pain for
//    // existing code.
//    if (_fc->queries_pending() > 0)
//	return false;
//#endif
//
//    //
//    // Fast path - Xrl resolution in cache and no Xrls ahead blocked on
//    // on response from Finder.  Fast path cannot be taken if earlier Xrls
//    // are blocked on Finder as re-ordering may occur.  We don't necessarily
//    // care about re-ordering between protocol families (at this time), but
//    // we do within protocol families.
//    //
//    string xrl_no_args = xrl.string_no_args();
//    const FinderDBEntry* fdbe = _fc->query_cache(xrl_no_args);
//    if (_dsl.empty() && fdbe) {
//	return send_resolved(xrl, fdbe, xcb, true);
//    }
//
//    //
//    // Slow path - involves more state copying
//    //
//    DispatchState *ds = new XrlRouterDispatchState(xrl, xcb);
//    _dsl.push_back(ds);
//    _fc->query(eventloop(), xrl_no_args,
//	       callback(this, &XrlRouter::resolve_callback, ds));
//
//    return true;
}

XrlError
XrlRouter::dispatch_xrl(const string&	method_name,
			const XrlArgs&	inputs,
			XrlArgs&	outputs) const
{
    string resolved_method;

throw std::logic_error("NYI");
//    if (_fc->query_self(method_name, resolved_method) == true) {
//	return XrlDispatcher::dispatch_xrl(resolved_method, inputs, outputs);
//    }
//    debug_msg("Could not find mapping for %s\n", method_name.c_str());
//    return XrlError::NO_SUCH_METHOD();
}

string
XrlRouter::finder_path() const
{
    if (_fac != 0)
throw std::logic_error("NYI");
//	return string(c_format("%s/%u", _fac->finder_address().str().c_str(), _fac->finder_port()));
    else if (_fac_ux)
throw std::logic_error("NYI");
//	return _fac_ux->finder_path();

    return FinderConstants::FINDER_DEFAULT_PATH();
}

IPv4
XrlRouter::finder_address() const
{
    if (_fac != 0)
throw std::logic_error("NYI");
//	return _fac->finder_address();

    return IPv4::LOOPBACK();
}

uint16_t
XrlRouter::finder_port() const
{
    if (_fac != 0)
throw std::logic_error("NYI");
//	return _fac->finder_port();

    return FinderConstants::FINDER_DEFAULT_PORT();
}

void
XrlRouter::finder_connect_event()
{
    debug_msg("Finder connect event\n");
}

void
XrlRouter::finder_disconnect_event()
{
    debug_msg("Finder disconnect event\n");
    //    _failed = true;
}

void
XrlRouter::finder_ready_event(const string& tgt_name)
{
    UNUSED(tgt_name);
    debug_msg("Finder target ready event: \"%s\"\n", tgt_name.c_str());
}


// ----------------------------------------------------------------------------
// wait_until_xrl_router_is_ready

void
wait_until_xrl_router_is_ready(EventLoop& eventloop, XrlRouter& xrl_router)
{
    while (xrl_router.failed() == false) {
	eventloop.run();
	if (xrl_router.ready())
	    return;
    }

    static const char* msg = "XrlRouter failed.  No Finder?";
    if (xlog_is_running()) {

throw std::logic_error("NYI");
//	XLOG_ERROR("%s", msg);
//	xlog_stop();
//	xlog_exit();
    } else {
	fprintf(stderr, msg);
    }
    exit(-1);
}
