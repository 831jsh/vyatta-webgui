#!/usr/bin/perl 
use CGI; 
my $cgi = new CGI; 
my $file = $cgi->param('mypcfile');
open(LOCAL, ">/tmp/$file") or die $!; 
while(<$file>) { 
    print LOCAL $_; 
} 
