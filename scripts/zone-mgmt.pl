#!/usr/bin/perl
#
# Module: zone-mgmt.pl
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
# Author: Mohit Mehta
# Date: May 2009
# Description: backend<->frontend zone management script
#
# **** End License ****
#

use lib "/opt/vyatta/share/perl5";
use warnings;
use strict;
use Switch;
use Getopt::Long;
use Vyatta::Config;
use Vyatta::Zone;
use OpenApp::Conf;

sub get_zoneinfo {
  my $zonename = shift;
  my $returnstring = "zone=[$zonename]";
  my $zoneintfs = "";
  my $description = "";

  $zoneintfs = join(',', Vyatta::Zone::get_zone_interfaces("returnValues", $zonename));
  $returnstring .= ",interfaces=[$zoneintfs]";

  my $config = new Vyatta::Config;
  $config->setLevel("zone-policy zone $zonename");
  $description = $config->returnValue('description');
  $returnstring .= ",description=[$description]" if defined $description;
  $returnstring .= ",description=[]" if ! defined $description;

  $returnstring .= ":";
  return $returnstring;
}

sub execute_get_zoneinfo {
  my $zonename = shift;
  my $return_string;

  if ($zonename eq 'ALL') {
    # return info for all zones
    my @all_zones = Vyatta::Zone::get_all_zones("listNodes");
    foreach my $zone (sort @all_zones) {
      $return_string .= get_zoneinfo($zone);
    }
  } else {
    # return info for a particular zone
    $return_string .= get_zoneinfo($zonename);
  }

  $return_string = "<zone-mgmt>$return_string</zone-mgmt>";
  print "$return_string";

}

sub execute_get_avail_intfs {
  # return all available interfaces that can be added to a zone
}

sub usage() {
    print "     $0 --action='<action>' --args='<arguments>'\n";
    exit 1;
}

#
# main
#

my ($action, $args);

GetOptions(
    "action=s"                  => \$action,
    "args=s"                    => \$args,
    );

usage() if ! defined $action;

# convert any capital letters to small caps to avoid any confusion
$action =~ tr/A-Z/a-z/;

switch ($action) {
  case 'get-zone-info'
  {
    execute_get_zoneinfo($args);
  }
  case 'get-available-interfaces'
  {
    execute_get_avail_intfs($args);
  }
  else
  {
    # invalid action
    print "Invalid Action for $0\n";
    exit 1;
  }
}

exit 0;
