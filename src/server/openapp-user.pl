#!/usr/bin/perl
#
# Module: openapp-user.pl
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
# Portions created by Vyatta are Copyright (C) 2007 Vyatta, Inc.
# All Rights Reserved.
# 
# Author: Michael Larson
# Date: March 2009
# Description: Script to modify user accounts
# 
# **** End License ****
#

use lib "/opt/vyatta/share/perl5/";

use warnings;
use strict;
use POSIX;
use File::Copy;
use Getopt::Long;

my ($list,$delete,$modify,$add,$password,$lastname,$firstname,$email,$role,$rights);

#
# Add user <account>
# Add user rights
#
sub add_user {
    #write temp file.

    if (defined($password) && $password ne NULL && defined($email) && $email ne NULL && defined($lastname) && $lastname ne NULL && defined($firstname) && $firstname ne NULL) {

	my $conf_file = "/tmp/user-".$$;
	
#    print "$conf_file\n";
	
	open(FILE, ">$conf_file") or die "Can't open temp user file"; 
	
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: userPassword\n";
	print FILE "userPassword: ".$password."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: mail\n";
	print FILE "mail: ".$email."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: surname\n";
	print FILE "surname: ".$lastname."\n";
	print FILE "\n";
	print FILE "dn: uid=".$add.",ou=People,dc=localhost,dc=localdomain\n";
	print FILE "changetype: modify\n";
	print FILE "replace: commonname\n";
	print FILE "commonname: ".$firstname."\n";
	
	close FILE;
	
	#first add the user
	system("ldapadduser $add vyattacfg");
	
	#post message to all registered VMs:
	#POST /notifications/users/[username]
	
	#now modify the account
	system("ldapmodify -x -D \"cn=admin,dc=localhost,dc=localdomain\" -w admin -f $conf_file");
	#clean up temp file here.
	unlink($conf_file);
    }
    elsif (defined($rights) && $rights ne NULL){
	#modify rights on local system
	system("usermod -a -G $rights $add");
    }
}

#
# Modify user password
# Modify user email
# Modify user lastname
# Modify user firstname
#
sub modify_user {
    #write temp file.
    my $conf_file = "/tmp/user-".$$;

    print "$conf_file\n";

    open(FILE, ">$conf_file") or die "Can't open temp user file"; 

    print FILE "dn: uid=".$modify.",ou=People,dc=localhost,dc=localdomain\n";
    print FILE "changetype: modify\n";
    if (defined($email) && $email ne NULL) {
	print FILE "replace: mail\n";
	print FILE "mail: ".$email."\n";
    }
    elsif (defined($lastname) && $lastname ne NULL) {
	print FILE "replace: surname\n";
	print FILE "surname: ".$lastname."\n";
    }
    elsif (defined($firstname) && $firstname ne NULL) {
	print FILE "replace: commonname\n";
	print FILE "commonname: ".$firstname."\n";
    }
    elsif (defined($password) && $password ne NULL) {
	print FILE "add: password\n";
	print FILE "password: ".$password."\n";
    }
    print FILE "\n";

    close FILE;

    #now modify the account
    system("ldapmodify -x -D \"cn=admin,dc=localhost,dc=localdomain\" -w admin -f $conf_file");
    #clean up temp file here.
    unlink($conf_file);
}

#
# delete user <account>
# delete user rights
#
sub del_user {
    # post notification to VMs: 
    # DELETE /notifications/users/[username]
    my @groups;
    my $grp;
    if ($rights != NULL) {
	#how to remove???
	#get group list and modify
	@groups = system("id -G $delete");
	#now remove $rights from $groups--probably need to eat a comma....
	$grp = $groups[0];
	$grp =~ s/$rights/''/; 
	system("usermod -G $grp $delete");
    }
    else {
	system("ldapdeleteuser $delete");
    }
}

sub list_user {
    #if $list is empty then list all
#
    my @output;
    my $output;
    if ($list eq '') {
	@output = `ldapsearch -x -b "dc=localhost,dc=localdomain" "uid=*"`;
    }
    else {
	@output = `ldapsearch -x -b "dc=localhost,dc=localdomain" "uid=$list"`;
    }
#   now construct and print out xml response
# foo, People, nodomain
#dn: uid=foo,ou=People,dc=nodomain
#objectClass: account
#objectClass: posixAccount
#cn: foo
#uid: foo
#uidNumber: 1001
#gidNumber: 1001
#homeDirectory: /home/foo
#loginShell: /bin/bash
#gecos: foo
#description: User account

#how to parse the stdout

# cn: foo

    #iterate by line
    my $open_entry = 0;
    print "VERBATIM_OUTPUT\n";
    for $output (@output) {
#	print $output;
	my @o = split(' ',$output);
	if (defined $o[0] && defined $o[1]) {
	    if ($o[0] eq "uid:") {
		$open_entry = 1;
		print "<user name='$o[1]'>";
	    }
	    if ($o[0] eq 'mail:') {
		print "<email>$o[1]</email>";
	    }
	    #The assumption is that mail is the last entry per user
#	    print "<first>$o[1]</first>";
	    if ($o[0] eq 'sn:') {
		print "<name>";
		print "<last>$o[1]</last>";
	    }
	    if ($o[0] eq 'cn:') {
		print "<first>$o[1]</first>";
	    }
	    
	    my @groups;
	    if ($open_entry == 1 && $o[0] eq '#') {
		print "</name>";

		#use system call to retrieve rights
		print "<rights>";
		@groups = system("id -G $list");
		#will need to convert to strings.
		print "</rights>";
		print "<role>user</role>";
		
		print "</user>";
		$open_entry = 0;
	    }
	}
    }
}

####main

sub usage() {
    print "Usage: $0 --delete=<username>\n";
    print "       $0 --add=<username>\n";
    print "       $0 --list=<username>\n";
    print "       $0 --password=<password>\n";
    print "       $0 --lastname=<lastname>\n";
    print "       $0 --firstname=<firstname>\n";
    print "       $0 --email=<email>\n";
    print "       $0 --role=<role>\n";
    print "       $0 --rights=<right>\n";
    exit 1;
}

my @delete_user = ();

# Here are the forms of the command:
#
# modify [user] [password]
# modify [user] [email]
# modify [user] [lastname]
# modify [user] [firstname]
# add [user] [password] [lastname] [firstname] [email] [role] [rights]
# add [user] [rights]
# delete [user] [rights]
# delete [user]
# list 
# list [user]


#pull commands and call command
GetOptions(
    "add=s"           => \$add,
    "modify=s"        => \$modify,
    "password=s"      => \$password,
    "lastname=s"      => \$lastname,
    "firstname=s"     => \$firstname,
    "email=s"         => \$email,
    "role=s"          => \$role,
    "rights=s"        => \$rights,
    "delete=s"        => \$delete,
    "list:s"          => \$list,
    ) or usage();


if ( defined $modify ) {
    modify_user();
    exit 0;
}
if ( defined $add ) {
    add_user();
    exit 0;
}
if ( defined $delete ) {
    del_user();
    exit 0;
}
if ( defined $list ) {
    list_user();
    exit 0;
}
