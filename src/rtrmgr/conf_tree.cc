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

#include "rtrmgr_module.h"

#include "libxorp/xorp.h"
#include "libxorp/xlog.h"
#include "libxorp/debug.h"
#include "libxorp/utils.hh"

#include "conf_tree.hh"
#include "template_commands.hh"
#include "template_tree.hh"
#include "template_tree_node.hh"
#include "util.hh"


extern int init_bootfile_parser(const char* configuration,
				const char* filename, ConfigTree* ct);
extern void parse_bootfile() throw (ParseError);
extern int boot_parser_error(const char* s) throw (ParseError);
extern void boot_parser_warning(const char* s);

/*************************************************************************
 * Config File class
 *************************************************************************/

ConfigTree::ConfigTree(TemplateTree* tt, bool verbose)
    : _template_tree(tt),
      _verbose(verbose)
{

}

ConfigTree::~ConfigTree()
{
    // XXX: _root_node will handle the deletion of all the tree nodes
}

#if 0
ConfigTree&
ConfigTree::operator=(const ConfigTree& orig_tree)
{
    root_node().clone_subtree(orig_tree.const_root_node());
    return *this;
}
#endif

bool
ConfigTree::parse(const string& configuration, const string& config_file,
		  string& error_msg)
{
    try {
	init_bootfile_parser(configuration.c_str(), config_file.c_str(), this);
	parse_bootfile();
	return true;
    } catch (const ParseError& pe) {
	error_msg = pe.why();
    }

    return false;
}

void ConfigTree::add_default_children()
{
    root_node().recursive_add_default_children();
}

const TemplateTreeNode*
ConfigTree::find_template(const list<string>& path_segments) const
{
    const TemplateTreeNode *ttn;

    debug_msg("----------------------------------------------------------\n");
    debug_msg("looking for template for \"%s\"\n",
	      path_as_string(path_segments).c_str());

    ttn = _template_tree->find_node(path_segments);
    return ttn;
}

const TemplateTreeNode*
ConfigTree::find_template_by_type(const list<ConfPathSegment>& path_segments) const
{
    const TemplateTreeNode *ttn;

    ttn = _template_tree->find_node_by_type(path_segments);
    return ttn;
}

list<ConfPathSegment>
ConfigTree::path_as_segments() const
{
    list<ConfPathSegment> path_segments;
    ConfigTreeNode* ctn = _current_node;

    while (ctn->parent() != NULL) {
	path_segments.push_front(ConfPathSegment(ctn->segname(), 
						 ctn->type(), ctn->node_id()));
	ctn = ctn->parent();
    }
    return path_segments;
}

string
ConfigTree::current_path_as_string() const
{
    string path;
    ConfigTreeNode* ctn = _current_node;

    while (ctn->parent() != NULL) {
	if (ctn == _current_node)
	    path = ctn->segname();
	else
	    path = ctn->segname() + " " + path;
	ctn = ctn->parent();
    }
    return path;
}

string
ConfigTree::path_as_string(const list<string>& path_segments) const
{
    string path;
    list<string>::const_iterator iter;

    for (iter = path_segments.begin(); iter != path_segments.end(); ++iter) {
	if (path.empty())
	    path = *iter;
	else
	    path += " " + *iter;
    }
    return path;
}

void
ConfigTree::extend_path(const string& segment, int type,
			const ConfigNodeId& node_id)
{
   debug_msg("extend_path: %s, %s\n", segment.c_str(), node_id.str().c_str());
    _path_segments.push_back(ConfPathSegment(segment, type, node_id));
}

void
ConfigTree::pop_path()
{
    size_t segments_to_pop = _segment_lengths.front();

    _segment_lengths.pop_front();
    for (size_t i = 0; i < segments_to_pop; i++) {
	_current_node = _current_node->parent();
    }
}

bool
ConfigTree::push_path()
{
    string path = current_path_as_string();
    string nodename = _path_segments.back().segname();

    //
    // Keep track of how many segments comprise this frame so we can
    // pop the right number later.
    //
    size_t len = 0;
    bool ret = true;

    list<ConfPathSegment>::const_iterator iter;
    for (iter = _path_segments.begin(); iter != _path_segments.end(); ++iter) {
	if (!add_node(iter->segname(), iter->type(), iter->node_id())) {
          ret = false;
          break;
        }
        len++;
    }
    _segment_lengths.push_front(len);

    _path_segments.clear();
    return ret;
}

bool
ConfigTree::add_node(const string& segment, int type,
		     const ConfigNodeId& node_id)
    throw (ParseError)
{
    list<ConfigTreeNode*>::const_iterator iter;
    ConfigTreeNode *found = NULL;

    if (_current_node->template_tree_node() != NULL
	&& _current_node->template_tree_node()->children().empty()) {
	//
	// The current node's template has no children, and we've been
	// asked to add a node as a child of it.  Either this is an
	// error, or this current node is a terminal node, and this
	// segment is actually a value.
	//
	if (_current_node->is_leaf_value()) {
	    terminal_value(segment, _current_node->type(), OP_ASSIGN);
	} else {
	    boot_parser_error("Invalid child node");
	}

	//
	// If we're still here, we didn't throw a parse error.  One
	// minor glitch is that need to decrement the path segments
	// before poppping, because this has become infated due to
	// counting the final value.
	//
	size_t segments_to_pop = _segment_lengths.front();
	_segment_lengths.pop_front();
	segments_to_pop--;
	_segment_lengths.push_front(segments_to_pop);
	return true;
    }

    iter = _current_node->children().begin();
    while (iter != _current_node->children().end()) {
	if ((*iter)->segname() == segment) {
	    if (found != NULL) {
		//
		// If there are two nodes with the same segment name,
		// we can only distinguish between them by type.
		// extend_path doesn't have the type information
		// available because it wasn't at the relevant point
		// in the template file, so this is an error.  The
		// correct way to step past such a node would be
		// through a call to add_node().
		//
		string err = "Need to qualify type of " + segment + "\n";
		xorp_throw(ParseError, err);
	    }
	    found = *iter;
	}
	++iter;
    }
    if (found != NULL) {
	_current_node = found;
    } else {
	list<ConfPathSegment> path_segments = path_as_segments();
	path_segments.push_back(ConfPathSegment(segment, type, node_id));
	const TemplateTreeNode* ttn = find_template_by_type(path_segments);
	if (ttn == NULL) {
	    boot_parser_warning("Unknown config node ignored (no template)");
            return false;
	}

	string path = current_path_as_string();
	if (path.empty())
	    path = segment;
	else {
	    debug_msg("path: >%s<\n", path.c_str());
	    debug_msg("segment: >%s<\n", segment.c_str());
	    path += " " + segment;
	}
	found = create_node(segment, path, ttn, _current_node, node_id,
			    /* user_id */ 0, _verbose);
	_current_node = found;
    }
    return true;
}


void
ConfigTree::terminal_value(const string& value, int type, ConfigOperator op) 
    throw (ParseError)
{
    string error_msg;

    string path(current_path_as_string());
    string svalue = value;
    ConfigTreeNode *ctn = _current_node;

    XLOG_ASSERT(ctn != NULL);

    // Special case for bool types to avoid needing to type "true"
    if (svalue == "" && (type == NODE_VOID)) {
	if (ctn->type() == NODE_BOOL) {
	    type = NODE_BOOL;
	    svalue = "true";
	}
    }
    if ((ctn->type() == NODE_TEXT) && (type == NODE_TEXT)) {
	svalue = unquote(svalue);
    } else if ((ctn->type() == NODE_TEXT) && (type != NODE_TEXT)) {
	// We'll accept anything as text
    } else if ((ctn->type() == NODE_UINTRANGE) && (type == NODE_UINT)) {
	// Expand a single uint to a uintrange
	svalue += ".." + value;
    } else if ((ctn->type() == NODE_IPV4RANGE) && (type == NODE_IPV4)) {
	// Expand a single IPv4 to a ipv4range
	svalue += ".." + value;
    } else if ((ctn->type() == NODE_IPV6RANGE) && (type == NODE_IPV6)) {
	// Expand a single IPv6 to a ipv6range
	svalue += ".." + value;
    // Special case for bool types to avoid needing to type "true"
    } else if ((ctn->type() != NODE_TEXT) && (type == NODE_TEXT)) {
	//
	// The value was quoted in the bootfile.  We can't tell if
	// there's a mismatch without doing some secondary parsing.
	//
	svalue = unquote(svalue);

	switch (ctn->type()) {
	case NODE_VOID:
	    // Not clear what to do here
	    break;
	case NODE_UINT:
	    for (size_t i = 0; i < svalue.size(); i++) {
		if ((svalue[i] < '0') || (svalue[i] > '9')) {
		    goto parse_error;
		}
	    }
	    break;
	case NODE_BOOL:
	    if (svalue == "true" || svalue == "false" || svalue == "")
		break;
	    goto parse_error;
	case NODE_IPV4:
	    try {
		IPv4(svalue.c_str());
	    } catch (InvalidString) {
		goto parse_error;
	    }
	    break;
	case NODE_IPV4NET:
	    try {
		IPv4Net(svalue.c_str());
	    } catch (InvalidString) {
		goto parse_error;
	    }
	    break;
	case NODE_IPV6:
	    try {
		IPv6(svalue.c_str());
	    } catch (InvalidString) {
		goto parse_error;
	    }
	    break;
	case NODE_IPV6NET:
	    try {
		IPv6Net(svalue.c_str());
	    } catch (InvalidString) {
		goto parse_error;
	    }
	    break;
	case NODE_MACADDR:
	    try {
		Mac(svalue.c_str());
	    } catch (InvalidString) {
		goto parse_error;
	    }
	    break;
	case NODE_URL_FILE:
	case NODE_URL_FTP:
	case NODE_URL_HTTP:
	case NODE_URL_TFTP:
	    // TODO: we cannot do easily a secondary parsing of URLs
	    break;
	default:
	    // Did we forget to add a new type?
	    XLOG_FATAL("Unexpected type %d received", ctn->type());
	}
    } else if (ctn->type() != type) {
	error_msg = "\"" + path + "\" has type " + ctn->typestr() +
	    ", and value " + svalue + " is not a valid " + ctn->typestr();
	boot_parser_error(error_msg.c_str());
    }

    if (ctn->is_read_only()
	&& ctn->is_leaf_value()
	&& (! ctn->is_default_value(svalue))) {
	error_msg = "\"" + path + "\" is read-only node";
	boot_parser_error(error_msg.c_str());
    }

    if (ctn->set_value(svalue, /* userid */ 0, error_msg) != true) {
	error_msg = c_format("Cannot set the value of \"%s\": %s",
			     path.c_str(), error_msg.c_str());
	boot_parser_error(error_msg.c_str());
    }
    if (ctn->set_operator(op, /* userid */ 0, error_msg) != true) {
	error_msg = c_format("Cannot set the operator for \"%s\": %s",
			     path.c_str(), error_msg.c_str());
	boot_parser_error(error_msg.c_str());
    }
    return;

 parse_error:
    error_msg = "\"" + path + "\" has type " + ctn->typestr() +
	", and value " + svalue + " is not a valid " + ctn->typestr();
    boot_parser_error(error_msg.c_str());
}

const ConfigTreeNode*
ConfigTree::find_config_node(const list<string>& path_segments) const
{
    const ConfigTreeNode *found = &const_root_node();
    const ConfigTreeNode *found2 = found;
    list<string>::const_iterator pi;
    list<ConfigTreeNode *>::const_iterator ci;

    for (pi = path_segments.begin(); pi != path_segments.end(); ++pi) {
	for (ci = found->const_children().begin();
	     ci != found->const_children().end();
	     ++ci) {
	    if (*pi == (*ci)->segname()) {
		found2 = *ci;
		break;
	    }
	}
	if (found2 == found)
	    return NULL;
	found = found2;
    }
    return found;
}


string
ConfigTree::show_subtree(bool show_top, const list<string>& path_segments, 
			 bool numbered, bool suppress_default_values) const
{
    const ConfigTreeNode *found = find_config_node(path_segments);

    if (found == NULL)
	return "ERROR";

    string s = found->show_subtree(show_top,
				   /* depth */ 0,
				   /* indent */ 0,
				   /* do_indent */ true,
				   numbered,
				   /* annotate */ true,
				   suppress_default_values);
    return s;
}

string
ConfigTree::show_tree(bool numbered) const
{
    return const_root_node().show_subtree(/* show_top */ false,
					  /* depth */ 0,
					  /* indent */ 0,
					  /* do_indent */ true, 
					  numbered,
					  /* annotate */ true,
					  /* suppress_default_values */ false);
}

string
ConfigTree::show_unannotated_tree(bool numbered) const
{
    return const_root_node().show_subtree(/* show_top */ false,
					  /* depth */ 0,
					  /* indent */ 0,
					  /* do_indent */ true, 
					  numbered,
					  /* annotate */ false,
					  /* suppress_default_values */ false);
}

ConfigTreeNode*
ConfigTree::find_node(const list<string>& path)
{
    return root_node().find_node(path);
}

const ConfigTreeNode*
ConfigTree::find_const_node(const list<string>& path) const
{
    return const_root_node().find_const_node(path);
}

ConfigTreeNode*
ConfigTree::find_config_module(const string& module_name)
{
    return root_node().find_config_module(module_name);
}

string
ConfigTree::tree_str() const
{
    return const_root_node().subtree_str();
}

bool
ConfigTree::apply_deltas(uid_t user_id, const string& deltas,
			 bool provisional_change, bool preserve_node_id,
			 string& response)
{
    //vyatta removing to prevent passwd
    /*
    XLOG_TRACE(_verbose, "CT apply_deltas %u %s\n",
	       XORP_UINT_CAST(user_id), deltas.c_str());
    */
    ConfigTree* delta_tree = create_tree(_template_tree, _verbose);
    if (delta_tree->parse(deltas, "", response) == false)
	return false;

    debug_msg("Delta tree:\n");
    debug_msg("%s", delta_tree->tree_str().c_str());
    debug_msg("end delta tree.\n");

    response = "";
    bool result;
    result = root_node().merge_deltas(user_id, delta_tree->const_root_node(),
				      provisional_change, preserve_node_id,
				      response);
    delete delta_tree;
    return result;
}

bool
ConfigTree::apply_deletions(uid_t user_id, const string& deletions,
			    bool provisional_change, string& response)
{
    XLOG_TRACE(_verbose, "CT apply_deletions %u %s\n",
	       XORP_UINT_CAST(user_id), deletions.c_str());

    ConfigTree *deletion_tree = create_tree(_template_tree, _verbose);
    if (deletion_tree->parse(deletions, "", response) == false)
	return false;

    debug_msg("Deletion tree:\n");
    debug_msg("%s", deletion_tree->tree_str().c_str());
    debug_msg("end deletion tree.\n");

    response = "";
    bool result;
    result = root_node().merge_deletions(user_id,
					  deletion_tree->const_root_node(),
					  provisional_change, response);
    delete deletion_tree;
    return result;
}

void
ConfigTree::retain_different_nodes(const ConfigTree& them,
				   bool retain_changed_values)
{
    root_node().retain_different_nodes(them.const_root_node(),
				      retain_changed_values);
}

void
ConfigTree::retain_deletion_nodes(const ConfigTree& them,
				  bool retain_changed_values)
{
    root_node().retain_deletion_nodes(them.const_root_node(),
				      retain_changed_values);
}

void
ConfigTree::retain_common_nodes(const ConfigTree& them)
{
    root_node().retain_common_nodes(them.const_root_node());
}

void
ConfigTree::expand_varname_to_matchlist(const string& varname,
				      list<string>& matches) const
{
    // Trim $( and )
    string trimmed = varname.substr(2, varname.size()-3);

    // Split on dots
    list<string> sl = split(trimmed, '.');

    // Copy into a vector
    size_t len = sl.size();
    vector<string> v(len);
    for (size_t i = 0; i < len; i++) {
	v[i] = sl.front();
	sl.pop_front();
    }

    const_root_node().expand_varname_to_matchlist(v, 0, matches);
}

