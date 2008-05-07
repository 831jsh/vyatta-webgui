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


#ifndef __LIBPROTO_CONFIG_NODE_ID_HH__
#define __LIBPROTO_CONFIG_NODE_ID_HH__


#include "libxorp/xorp.h"
#include "libxorp/xlog.h"
#include "libxorp/exceptions.hh"

#include <sstream>
#include <list>
#include <map>

//#define XORP_MODULE_NAME	"CONFIG_NODE_ID"

//
// Configuration Node ID support
//

/**
 * @short Class for encoding and decoding configuration-related node IDs.
 *
 * The node ID is composed of two uint64_t integers.
 * The first integer is the unique node ID. The second integer is
 * the node positiion and is set to the unique node ID of the previous
 * node. If it is the first node, then the position is set to 0.
 * The upper half of the unique node ID (the most significant 32 bits)
 * is the instance ID. The lower half of the unique node ID (the least
 * significant 32 bits) is the unique part of the node ID for that instance.
 */
class ConfigNodeId {
public:
    typedef uint64_t UniqueNodeId;
    typedef uint64_t Position;
    typedef uint32_t InstanceId;

    /**
     * Constructor from a string.
     *
     * The string format is two uint64_t integers separated by space.
     * The first integer is the unique node ID. The second integer is
     * the node positiion and is set to the unique node ID of the previous
     * node. If it is the first node, then the position is set to 0.
     *
     * @param s the initialization string.
     */
    explicit ConfigNodeId(const std::string& s) throw (InvalidString) {
	copy_in(s);
    }

    /**
     * Constructor for a given unique node ID and position.
     *
     * @param unique_node_id the unique node ID.
     * @param position the position of the node.
     */
    ConfigNodeId(const UniqueNodeId& unique_node_id, const Position& position)
	: _unique_node_id(unique_node_id), _position(position) {}

    /**
     * Destructor
     */
    virtual ~ConfigNodeId() {}

    /**
     * Copy an unique node ID from a string into ConfigNodeId structure.
     *
     * @param from_string the string to copy the node ID from.
     * @return the number of copied octets.
     */
    inline size_t copy_in(const std::string& from_string) throw (InvalidString);

    /**
     * Equality Operator
     *
     * @param other the right-hand operand to compare against.
     * @return true if the left-hand operand is numerically same as the
     * right-hand operand.
     */
    inline bool operator==(const ConfigNodeId& other) const;

    /**
     * Return the unique node ID.
     *
     * @return the unique node ID.
     */
    const UniqueNodeId& unique_node_id() const { return (_unique_node_id); }

    /**
     * Return the position of the node.
     *
     * @return the position of the node.
     */
    const Position& position() const { return (_position); }

    /**
     * Set the instance ID.
     * 
     * @param v the instance ID.
     */
    inline void set_instance_id(const InstanceId& v);

    /**
     * Set the node position.
     * 
     * The node position is equal to the unique node ID of the previous node.
     *
     * @param v the node position.
     */
    void set_position(const Position& v) { _position = v; }

    /**
     * Generate a new unique node ID.
     *
     * Note that this instance is modified to the value of the new
     * unique node ID.
     *
     * @return a new unique node ID.
     */
    inline const ConfigNodeId& generate_unique_node_id();

    /**
     * Convert this node ID from binary form to presentation format.
     *
     * @return C++ string with the human-readable ASCII representation
     * of the node ID.
     */
    std::string str() const {
	std::ostringstream ost;
	//
	// XXX: We use ostringstream instead of the c_format() facility
	// because the c_format() facility doesn't work well for uint64_t
	// integers: on 32-bit architectures the coversion specifier
	// has to be %llu, while on 64-bit architectures it should be %lu.
	// Note that this is c_format() specific problem and it doesn't
	// exist for the system printf().
	//
	ost << _unique_node_id << " " << _position;
	return ost.str();
    }

    /**
     * Test if the node ID is empty.
     *
     * @return true if the node ID is empty, otherwise false.
     */
    bool is_empty() const { return (_unique_node_id == 0); }

    /**
     * Pre-defined constants.
     */
    static ConfigNodeId ZERO() { return ConfigNodeId(0, 0); }

private:
    UniqueNodeId	_unique_node_id;	// The unique node ID
    Position		_position;		// The position of the node
};

/**
 * @short Class for storing the mapping between a @ref ConfigNodeId node
 * and the corresponding value.
 *
 * Internally the class is implemented as a mapped linked list:
 * - A linked list of pairs <ConfigNodeId, typename V> contains
 *   the ConfigNodeId nodes and the corresponding values.
 * - An STL <map> stores the mapping between unique node IDs and the
 *   corresponding iterators in the above list.
 *
 * The advantage of such implementation is that the time to insert and
 * remove entries to/from the list is similar to the time to perform
 * those operations on an STL map container.
 */
template <typename V>
class ConfigNodeIdMap {
public:
    typedef std::list<std::pair<ConfigNodeId, V> >	ValuesList;
    typedef typename ValuesList::iterator	iterator;
    typedef typename ValuesList::const_iterator	const_iterator;

    /**
     * Default constructor
     */
    ConfigNodeIdMap() {}

    /**
     * Destructor
     */
    virtual ~ConfigNodeIdMap() {}

    /**
     * Get the iterator to the first element.
     * 
     * @return the iterator to the first element.
     */
    typename ConfigNodeIdMap::iterator begin() {
	return (_values_list.begin());
    }

    /**
     * Get the const iterator to the first element.
     * 
     * @return the const iterator to the first element.
     */
    typename ConfigNodeIdMap::const_iterator begin() const {
	return _values_list.begin();
    }

    /**
     * Get the iterator to the last element.
     * 
     * @return the iterator to the last element.
     */
    typename ConfigNodeIdMap::iterator end() { return (_values_list.end()); }

    /**
     * Get the const iterator to the last element.
     * 
     * @return the const iterator to the last element.
     */
    typename ConfigNodeIdMap::const_iterator end() const {
	return _values_list.end();
    }

    /**
     * Find an element for a given node ID.
     * 
     * @param node_id the node ID to search for.
     * @return the iterator to the element.
     */
    inline typename ConfigNodeIdMap::iterator find(const ConfigNodeId& node_id);

    /**
     * Find an element for a given node ID.
     * 
     * @param node_id the node ID to search for.
     * @return the const iterator to the element.
     */
    inline typename ConfigNodeIdMap::const_iterator find(const ConfigNodeId& node_id) const;

    /**
     * Insert a new element.
     * 
     * @param node_id the node ID of the element to insert.
     * @param v the value of the element to insert.
     * @return true a pair of two values: iterator and a boolean flag.
     * If the boolean flag is true, the element was inserted successfully,
     * and the iterator points to the new element. If the boolean flag is
     * false, then either there is an element with the same node ID, and the
     * iterator points to that element, or the element could not be inserted
     * because of invalid node ID and the iterator points to @ref end()
     * of the container.
     */
    inline std::pair<iterator, bool> insert(const ConfigNodeId& node_id,
				       const V& v) {
	return (insert_impl(node_id, v, false));
    }

    /**
     * Insert a new element that might be out-of-order.
     * 
     * @param node_id the node ID of the element to insert.
     * @param v the value of the element to insert.
     * @return true a pair of two values: iterator and a boolean flag.
     * If the boolean flag is true, the element was inserted successfully,
     * and the iterator points to the new element. If the boolean flag is
     * false, then there is an element with the same node ID, and the
     * iterator points to that element.
     */
    inline std::pair<iterator, bool> insert_out_of_order(
	const ConfigNodeId& node_id, const V& v) {
	return (insert_impl(node_id, v, true));
    }

    /**
     * Remove an existing element.
     * 
     * @param node_id the node ID of the element to remove.
     * @return the number of removed elements.
     */
    inline size_t erase(const ConfigNodeId& node_id);

    /**
     * Remove an existing element.
     * 
     * @param iter the iterator to the element to remove.
     */
    inline void erase(ConfigNodeIdMap::iterator iter);

    /**
     * Remove all elements.
     */
    void clear();

    /**
     * Convert this object from binary form to presentation format.
     *
     * @return C++ string with the human-readable ASCII representation
     * of the object.
     */
    inline std::string str() const;

    /**
     * Get the number of elements in the storage.
     * 
     * @return the number of elements in the storage.
     */
    size_t size() const { return (_node_id2iter.size()); }

    /**
     * Test if the container is empty.
     * 
     * @return true if the container is empty, otherwise false.
     */
    bool empty() const { return (size() == 0); }

private:
    /**
     * Insert a new element.
     * 
     * @param node_id the node ID of the element to insert.
     * @param v the value of the element to insert.
     * @param ignore_missing_previous_element if true, and the
     * previous element is not found, then insert the element at the
     * end of the container. If this flag is false and the previous element
     * is not found, then don't insert the element, but return an error.
     * @return true a pair of two values: iterator and a boolean flag.
     * If the boolean flag is true, the element was inserted successfully,
     * and the iterator points to the new element. If the boolean flag is
     * false, then either there is an element with the same node ID, and the
     * iterator points to that element, or the element could not be inserted
     * because of invalid node ID and the iterator points to @ref end()
     * of the container.
     */
    inline std::pair<iterator, bool> insert_impl(const ConfigNodeId& node_id,
					    const V& v,
					    bool ignore_missing_previous_element);

    typedef std::map<ConfigNodeId::UniqueNodeId, iterator> NodeId2IterMap;

    NodeId2IterMap	_node_id2iter;		// The node ID to iterator map
    ValuesList		_values_list;		// The list with the values
};

inline size_t
ConfigNodeId::copy_in(const std::string& from_string) throw (InvalidString)
{
    std::string::size_type space, ix;
    std::string s = from_string;

    if (s.empty()) {
	_unique_node_id = 0;
	_position = 0;
	return (from_string.size());
    }

    space = s.find(' ');
    if ((space == std::string::npos) || (space == 0) || (space >= s.size() - 1)) {
	xorp_throw(InvalidString,
		   c_format("Bad ConfigNodeId \"%s\"", s.c_str()));
    }

    //
    // Check that everything from the beginning to "space" is digits,
    // and that everything after "space" to the end is also digits.
    //
    for (ix = 0; ix < space; ix++) {
	if (! xorp_isdigit(s[ix])) {
	    xorp_throw(InvalidString,
		       c_format("Bad ConfigNodeId \"%s\"", s.c_str()));
	}
    }
    for (ix = space + 1; ix < s.size(); ix++) {
	if (! xorp_isdigit(s[ix])) {
	    xorp_throw(InvalidString,
		       c_format("Bad ConfigNodeId \"%s\"", s.c_str()));
	}
    }

    //
    // Extract the unique node ID and the position.
    //
    std::string tmp_str = s.substr(0, space);
    _unique_node_id = strtoll(tmp_str.c_str(), (char **)NULL, 10);
    tmp_str = s.substr(space + 1);
    _position = strtoll(tmp_str.c_str(), (char **)NULL, 10);

    return (from_string.size());
}

inline bool
ConfigNodeId::operator==(const ConfigNodeId& other) const
{
    return ((_unique_node_id == other._unique_node_id)
	    && (_position == other._position));
}

inline void
ConfigNodeId::set_instance_id(const InstanceId& v)
{
    // Set the upper 32 bits to the instance ID
    uint64_t h = (0xffffffffU & v);
    h = h << 32;
    _unique_node_id &= 0xffffffffU;
    _unique_node_id |= h;
}

inline const ConfigNodeId&
ConfigNodeId::generate_unique_node_id()
{
    // Check that the lower 32 bits of the unique node ID won't overflow
    XLOG_ASSERT((0xffffffffU & _unique_node_id) + 1 != 0);

    _unique_node_id++;

    return (*this);
}

template <typename V>
inline typename ConfigNodeIdMap<V>::iterator
ConfigNodeIdMap<V>::find(const ConfigNodeId& node_id)
{
    typename NodeId2IterMap::iterator node_id_iter;

    node_id_iter = _node_id2iter.find(node_id.unique_node_id());
    if (node_id_iter == _node_id2iter.end())
	return (_values_list.end());

    return (node_id_iter->second);
}

template <typename V>
inline typename ConfigNodeIdMap<V>::const_iterator
ConfigNodeIdMap<V>::find(const ConfigNodeId& node_id) const
{
    typename NodeId2IterMap::const_iterator node_id_iter;

    node_id_iter = _node_id2iter.find(node_id.unique_node_id());
    if (node_id_iter == _node_id2iter.end())
	return (_values_list.end());

    return (node_id_iter->second);
}

template <typename V>
inline std::pair<typename ConfigNodeIdMap<V>::iterator, bool>
ConfigNodeIdMap<V>::insert_impl(const ConfigNodeId& node_id, const V& v,
				bool ignore_missing_previous_element)
{
    typename NodeId2IterMap::iterator node_id_iter;
    typename ValuesList::iterator values_iter;

    node_id_iter = _node_id2iter.find(node_id.unique_node_id());
    if (node_id_iter != _node_id2iter.end()) {
	values_iter = node_id_iter->second;
	XLOG_ASSERT(values_iter != _values_list.end());
	return (make_pair(values_iter, false));	// Node already exists
    }

    // Find the iterator to the previous element
    values_iter = _values_list.begin();
    do {
	if (node_id.position() == 0) {
	    // The first element
	    values_iter = _values_list.begin();
	    break;
	}
	if (_values_list.size() == 0) {
	    if (! ignore_missing_previous_element) {
		// Error: no other elements found
		return (make_pair(_values_list.end(), false));
	    }
	    values_iter = _values_list.end();
	    break;
	}
	// Find the iterator to the previous element
	node_id_iter = _node_id2iter.find(node_id.position());
	if (node_id_iter == _node_id2iter.end()) {
	    if (! ignore_missing_previous_element) {
		// Error: the previous element is not found
		return (make_pair(_values_list.end(), false));
	    }
	    values_iter = _values_list.end();
	    break;
	}
	values_iter = node_id_iter->second;
	// XXX: increment the iterator to point to the insert position
	++values_iter;
	break;
    } while (false);

    // Insert the new element
    values_iter = _values_list.insert(values_iter, make_pair(node_id, v));
    XLOG_ASSERT(values_iter != _values_list.end());
    std::pair<typename NodeId2IterMap::iterator, bool> res = _node_id2iter.insert(
	make_pair(node_id.unique_node_id(), values_iter));
    XLOG_ASSERT(res.second == true);

    return (make_pair(values_iter, true));
}

template <typename V>
inline size_t
ConfigNodeIdMap<V>::erase(const ConfigNodeId& node_id)
{
    typename NodeId2IterMap::iterator node_id_iter;
    typename ValuesList::iterator values_iter;

    node_id_iter = _node_id2iter.find(node_id.unique_node_id());
    if (node_id_iter == _node_id2iter.end())
	return (0);		// No element found to erase

    values_iter = node_id_iter->second;
    _node_id2iter.erase(node_id_iter);
    _values_list.erase(values_iter);

    return (1);			// One element erased
}

template <typename V>
inline void
ConfigNodeIdMap<V>::erase(ConfigNodeIdMap::iterator iter)
{
    if (iter == _values_list.end())
	return;

    const ConfigNodeId& node_id = iter->first;
    erase(node_id);
}

template <typename V>
inline void
ConfigNodeIdMap<V>::clear()
{
    _node_id2iter.clear();
    _values_list.clear();
}

template <typename V>
inline std::string
ConfigNodeIdMap<V>::str() const
{
    typename ConfigNodeIdMap::const_iterator iter;
    std::string res;
    for (iter = _values_list.begin(); iter != _values_list.end(); ++iter) {
	if (iter != _values_list.begin())
	    res += ", ";
	res += iter->first.str();
    }
    return (res);
}

#endif // __LIBPROTO_CONFIG_NODE_ID_HH__
