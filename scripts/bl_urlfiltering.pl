#!/usr/bin/perl
#
# Module: bl_urlfiltering.pl
#
# **** License ****
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# This code was originally developed by Vyatta, Inc.
# Portions created by Vyatta are Copyright (C) 2009 Vyatta, Inc.
# All Rights Reserved.
#
# Author: Stig Thormodsrud
# Date: May 2009
# Description: backend<->frontend url filtering "buisness logic"
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use OpenApp::Conf;
use XML::Simple;
use Data::Dumper;
use POSIX;

my %dispatcher = (
    'filter_get'     => \&filter_get,
    'filter_set'     => \&filter_set,
    'whitelist_get'  => \&whitelist_get,
    'whitelist_set'  => \&whitelist_set,
    'keyword_get'    => \&keyword_get,
    'keyword_set'    => \&keyword_set,
);

my %days_hash = (
    'Sun'      => 's',
    'Mon'      => 'm',
    'Tue'      => 't',
    'Wed'      => 'w',
    'Thu'      => 'h',
    'Fri'      => 'f',
    'Sat'      => 'a',
);

my @cat_levels = ('strict', 'productivity', 'legal');

my @level_legal        = qw(adult 
                            agressif 
                            dangerous_material 
                            drogue 
                            gambling 
                            hacking
                            malware
                            mixed_adult 
                            phishing 
                            sexual_education 
                            sect 
                            warez);

my @level_productivity = qw(astrology 
                            audio-video 
                            celebrity 
                            dating 
                            filehosting 
                            financial 
                            games 
                            manga
                            marketingware 
                            publicite 
                            radio 
                            tricheur 
                            shopping);
push @level_productivity, @level_legal;

my @level_strict       = qw(blog 
                            child
                            cleaning 
                            forums 
                            reaffected 
                            redirector 
                            strict_redirector 
                            strong_redirector 
                            webmail);
push @level_strict, @level_productivity;

my $wb_log = '/tmp/wb';

sub wb_log {
    my $timestamp = strftime("%Y%m%d-%H:%M.%S", localtime);
    open my $fh, '>>', $wb_log
	or die "Can't open $wb_log: $!";
    print $fh "$timestamp: ", @_ , "\n";
    close $fh;
}

sub get_configured_block_level {
    my $path = 'service webproxy url-filtering squidguard';
    my $config = new Vyatta::Config; 
    $config->setLevel("$path policy-rule 1024");
    my @block_cats = $config->returnOrigValues('local-block');
    if (scalar(@block_cats) > 0) {
	my %level_hash = map { $_ => 1} @cat_levels;
	my $level = undef;
	foreach my $cat (@block_cats) {
	    if ($level_hash{$cat}) {
		return $cat;
	    }
	}
    }
    return;
}

sub filter_get {

    my $msg;
    $msg  = "<form name='url-filtering-easy-config' code='0'>";
    $msg .= "<url-filtering-easy-config>";

    my $config = new Vyatta::Config; 
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path policy-rule 1024");

    $msg .= "<policy>";
    # check whitelist
    if ($config->existsOrig('local-ok')) {
	$msg .= "<whitelist status='true'></whitelist>";
    } 

    # check keyword
    if ($config->existsOrig('local-block-keyword')) {
	$msg .= "<keyword status='true'></keyword>";
    } 

    # check blacklist
    my $level = get_configured_block_level();
    if ($level) {
	$msg .= "<blacklist status='true'>";
	$msg .= "<$level>true</$level>";
	$msg .= "</blacklist>";
    }
    $msg .= "</policy>";

    # check schedule
    $msg .= "<schedule>";
    $config->setLevel("$path time-period OA days");
    my @days = $config->listOrigNodes();
    if (scalar(@days) > 0) {
	foreach my $day (@days) {
	    if ($days_hash{$day}) {
		$config->setLevel("$path time-period OA days $day");
		my $times = $config->returnOrigValue('time');	
		if ($times) {
		    $msg .= "<$days_hash{$day}>$times</$days_hash{$day}>";
		}
	    }
	}
    }
    $msg .= "</schedule>";
    # footer
    $msg .= "</url-filtering-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub is_webproxy_configured {
    my $config = new Vyatta::Config; 
    my $path   = 'service webproxy url-filtering squidguard policy-rule 10';
    $config->setLevel($path);
    if ($config->existsOrig('source-group')) {   
	wb_log("webproxy is configured");
	return 1;
    } 
    wb_log("webproxy is NOT configured");
    return;
}

sub configure_webproxy {
    my (@cmds, $path);

    $path = 'service webproxy url-filtering squidguard';
    my $redirect = "http://172.16.117.2/cgi-bin/squidGuard-simple.cgi?";
    $redirect   .= "targetclass=%t&url=%u&srcclass=%s";

    push @cmds, 
         "set service webproxy listen-address 127.0.0.1 disable-transparent";
    push @cmds, "set service webproxy listen-address 192.168.1.1";
    push @cmds, "set service webproxy cache-size 0";
    push @cmds, "set $path source-group ALL address 0.0.0.0/0";
    push @cmds, "set $path source-group NONE address 255.255.255.255";

    push @cmds, "set $path policy-rule 1024 description 'OA state storage'";
    push @cmds, "set $path policy-rule 1024 source-group NONE";

    push @cmds, "set $path policy-rule 1025 description 'OA disabled storage'";
    push @cmds, "set $path policy-rule 1025 source-group NONE";

    push @cmds, "set $path policy-rule 10 source-group ALL";
    push @cmds, "set $path policy-rule 10 description 'OA'";
    push @cmds, "set $path policy-rule 10 local-ok 192.168.1.1";
    push @cmds, "set $path policy-rule 10 log all";
    push @cmds, "set $path redirect-url \"$redirect\" ";

    return @cmds;
}

sub get_blacklist_categories {
    my ($level) = @_;
    
    my @blocks = ();
    switch ($level) {
	case 'strict'       { @blocks = @level_strict; }
	case 'productivity' { @blocks = @level_productivity; }
	case 'legal'        { @blocks = @level_legal; }
    }
    my @cmds = ();
    my $path = 'service webproxy url-filtering squidguard policy-rule 10';
    foreach my $block (@blocks) {
	push @cmds, "set $path block-category $block";
    }
    return @cmds;
}

sub filter_set {
    my ($data) = @_;

    wb_log("filter_set:");
    my $xs  = new XML::Simple;
    my $xml = $xs->XMLin($data);
    my $config = new Vyatta::Config;
    my $path = 'service webproxy url-filtering squidguard';
    my ($msg, $err);
    my $whitelist = $xml->{policy}->{whitelist}->{status};
    my $blacklist = $xml->{policy}->{blacklist}->{status};
    my $keyword   = $xml->{policy}->{keyword}->{status};
    my $category;
    if ($blacklist and $blacklist eq 'true') {
	wb_log("filter_set: blacklist true");
	foreach my $cat (@cat_levels) {
	    my $x = $xml->{policy}->{blacklist}->{$cat};
	    if ($x and $x eq 'true') {
		$category = $cat;
		last;
	    }
	}
	if (! defined $category) {
	    wb_log("filter_set: Invalid block category");
	    $msg  = "<form name='url-filtering-easy-config' code='1'>";
	    $msg .= "<key>blacklist<key>";
	    $msg .= "<errmsg>Invalid block category</errmsg>";
	    $msg .= "</form>";
	    print $msg;
	    return 1;
	}
	wb_log("filter_set: block [$category]");
    }
    
    my @cmds = ();
    if (!is_webproxy_configured()) {
	@cmds = configure_webproxy();
    }

    if ($whitelist and $whitelist eq 'true') {
	wb_log("filter_set: whitelist true");
	push @cmds, "set $path policy-rule 1024 local-ok OA";
    }
    if ($keyword and $keyword eq 'true') {
	wb_log("filter_set: keyword true");
	push @cmds, "set $path policy-rule 1024 local-block-keyword OA";
    }
    if ($blacklist and $blacklist eq 'true') {
	my $level = get_configured_block_level();
	if ($level and $level ne $category) {
	    wb_log("filter_set: delete $category");
	    push @cmds, "delete $path policy-rule 1024 local-block $level";
	    push @cmds, "delete $path policy-rule 10 block-category";
	}
	push @cmds, "set $path policy-rule 1024 local-block $category";
	push @cmds, get_blacklist_categories($category);
    } else {
	$config->setLevel("$path policy-rule 1024");
	if ($config->existsOrig('local-block')) {  
	    wb_log("filter_set: delete block level");
	    push @cmds, "delete $path policy-rule 1024 local-block";
	    push @cmds, "delete $path policy-rule 10 block-category";	    
	}
    }

    # get time schedule
    my $time_period = undef;
    # check if old time-period needs delete
    $config->setLevel("$path time-period");
    if ($config->existsOrig('OA')) {  
	push @cmds, "delete $path time-period OA";
	push @cmds, "delete $path policy-rule 10 time-period";
	# kludge until cli can support delete/set combo
	push @cmds, "commit";
    }
    while (my ($k, $v) = each(%days_hash)) {
	my $day_time = $xml->{schedule}->{$v};
	if ($day_time) {
	    $time_period = "OA";
	    push @cmds, "set $path time-period OA days $k time \"$day_time\"";
	}
    }
    if ($time_period) {
	push @cmds, "set $path policy-rule 10 time-period OA";
    }
    
    push @cmds, ('commit', 'save');
    my $tmp = join("\n", @cmds);
    wb_log("filter_set: $tmp");
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	$msg  = "<form name='url-filtering-easy-config' code='1'>";
	$msg .= "<key>execute</key><errmsg>$err</errmsg></form>";
	print $msg;
	exit 1;
    }
    $msg  = "<form name='url-filtering-easy-config' code='0'>";
    print $msg;
}

sub whitelist_get {
    wb_log("whitelist_get:");
    my $msg;
    $msg  = "<form name='white-list-easy-config' code='0'>";
    $msg .= "<white-list-easy-config>";
    my $config = new Vyatta::Config; 
    my $path   = 'service webproxy url-filtering squidguard';

    # get enabled whitelist entries
    $config->setLevel("$path policy-rule 10 local-ok");
    my @local_ok_sites = $config->returnOrigValues();

    # get disabled whitelist entries
    $config->setLevel("$path policy-rule 1025 local-ok");
    my @local_ok_sites_not = $config->returnOrigValues();
    if (scalar(@local_ok_sites_not) > 0) {
	push @local_ok_sites, @local_ok_sites_not;
    }

    my $i = 0;
    foreach my $site (@local_ok_sites) {
	next if $site eq '192.168.1.1';  # listen-address
	$msg .= "<url><![CDATA[$site]]></url>";
	$i++;
    }
    wb_log("whitelist_get: $i sent");
    $msg .= "</white-list-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub whitelist_set {
    my ($data) = @_;

    wb_log("whitelist_set:");
    my $xs  = XML::Simple->new(ForceArray => 1, KeepRoot => 0);
    my $xml = $xs->XMLin($data);
    my ($msg, $err);
    my @cmds = ();
    if (!is_webproxy_configured()) {
	wb_log("whitelist_set: adding webproxy config");
	@cmds = configure_webproxy();
    }
    my $path = 'service webproxy url-filtering squidguard';
    my $i = 0;
    while ($i < 100) {
	my $whitelist = $xml->{url}[$i]->{content};
	my $action    = $xml->{url}[$i]->{action};
	my $rule = 10;
	#
	# Entries that are disabled have a "!" as the 1st character.
	# Store disabled entries in rule 1025 and enabled ones
	# in the OA policy-rule (i.e. 10).
	#
	$rule = 1025 if $whitelist and $whitelist =~ /^\!/;
	if ($whitelist and $action) {
	    if ($action eq 'add') {
		push @cmds, "set $path policy-rule 1024 local-ok OA";
		push @cmds, 
		"set $path policy-rule $rule local-ok \"$whitelist\" ";
	    } else {
		push @cmds, 
		"delete $path policy-rule $rule local-ok \"$whitelist\" ";
	    }
	} else {
	    last;
	}
	$i++;
    }
    wb_log("whitelist_set: i = $i, $#cmds cmds");
    if ($i < 1) {
	$msg  = "<form name='white-list-easy-config' code='1'>";
	$msg .= "<key>whitelist</key><errmsg>No urls</errmsg></form>";
	print $msg;
	exit 1;
    }
    push @cmds, ('commit', 'save');
    wb_log("whitelist_set: pre-execute $#cmds cmds");
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	wb_log("whitelist_set: execute err $err");
	$msg  = "<form name='white-list-easy-config' code='1'>";
	$msg .= "<key>execute</key><errmsg>$err</errmsg></form>";
	print $msg;
	exit 1;
    }
    wb_log("whitelist_set: execute OK");
    $msg = "<form name='white-list-easy-config' code='0'></form>";
    print $msg;
}

sub keyword_get {
    wb_log("keyword_get:");
    my $msg;
    $msg  = "<form name='banned-list-easy-config' code='0'>";
    $msg .= "<banned-list-easy-config>";
    my $config = new Vyatta::Config; 

    # get blocked keyword/regex
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path policy-rule 10 local-block-keyword");
    my @block_keywords = $config->returnOrigValues();

    # get disabled blocked keyword/regex
    my $path = 'service webproxy url-filtering squidguard';
    $config->setLevel("$path policy-rule 1025 local-block-keyword");
    my @block_keywords_not = $config->returnOrigValues();
    if (scalar(@block_keywords_not) > 0) {
	push @block_keywords, @block_keywords_not;
    }

    my $i = 0;
    foreach my $keyword (@block_keywords) {
	$msg .= "<keyword><![CDATA[$keyword]]></keyword>";
	$i++;
    }
    wb_log("keyword_get: $i sent");
    $msg .= "</banned-list-easy-config>";
    $msg .= "</form>";
    print $msg;
}

sub keyword_set {
    my ($data) = @_;

    wb_log("keyword_set:");
    my $xs  = XML::Simple->new(ForceArray => 1, KeepRoot => 0);
    my $xml = $xs->XMLin($data);
    my ($msg, $err);
    my @cmds = ();
    if (!is_webproxy_configured()) {
	@cmds = configure_webproxy();
    }
    my $path   = 'service webproxy url-filtering squidguard';
    my $i = 0;
    while ($i < 100) {
	my $keyword = $xml->{keyword}[$i]->{content};
	my $action  = $xml->{keyword}[$i]->{action};
	my $rule = 10;
	#
	# Entries that are disabled have a "!" as the 1st character.
	# Store disabled entries in rule 1025 and enabled ones
	# in the OA policy-rule (i.e. 10).
	#
	$rule = 1025 if $keyword and $keyword =~ /^\!/;
	if ($keyword and $action) {
	    if ($action eq 'add') {
		push @cmds, 
		"set $path policy-rule 1024 local-block-keyword OA";
		push @cmds, 
		"set $path policy-rule $rule local-block-keyword \"$keyword\" ";
	    } else {
		push @cmds, 
		"delete $path policy-rule $rule local-block-keyword \"$keyword\" ";
	    }
	} else {
	    last;
	}
	$i++;
    }
    wb_log("keyword_set: i = $i, $#cmds cmds");
    if ($i < 1) {
	$msg  = "<form name='banned-list-easy-config' code='1'>";
	$msg .= "<key>banned</key><errmsg>No keywords</errmsg></form>";
	print $msg;
	exit 1;
    }

    push @cmds, ('commit', 'save');
    wb_log("keyword_set: pre-execute $#cmds cmds");
    $err = OpenApp::Conf::execute_session(@cmds);
    if (defined $err) {
	wb_log("keyword_set: execute err $err");
	$msg  = "<form name='banned-list-easy-config' code='1'>";
	$msg .= "<key>execute</key><errmsg>$err</errmsg></form>";
	print $msg;
	exit 1;
    }
    wb_log("keyword_set: execute OK");
    $msg  = "<form name='banned-list-easy-config' code='0'></form>";
    print $msg;
}

#
# main
#
my ($mode, $oper, $data);
GetOptions("mode=s"    => \$mode,
	   "oper=s"    => \$oper,
	   "data=s"    => \$data,
);

die "Error: undefined mode"       if ! defined $mode;
die "Error: undefined operation"  if ! defined $oper;
die "Error: undefined data"       if $oper eq 'set' and ! $data;

my $do = $dispatcher{"$mode\_$oper"};

die "Error: undefined dispatcher" if ! defined $do;

# make it so ...
$do->($data);

exit 0;

# end of file