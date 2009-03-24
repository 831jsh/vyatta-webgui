#!/usr/bin/perl

use strict;
use Getopt::Long;
use lib '/opt/vyatta/share/perl5';
use OpenApp::VMMgmt;
use OpenApp::LdapUser;

# authenticated user
my $OA_AUTH_USER = $ENV{OA_AUTH_USER};
my $auth_user = new OpenApp::LdapUser($OA_AUTH_USER);
my $auth_user_role = $auth_user->getRole();
if ($auth_user_role ne 'installer' && $auth_user_role ne 'admin') {
  # not authorized
  exit 1;
}

# take care of forked processes
$SIG{CHLD} = 'IGNORE';
sub fdRedirect {
  open STDOUT, '>', '/dev/null';
  open STDERR, '>&STDOUT';
  open STDIN, '<', '/dev/null';
}

my ($action, $vmid) = (undef, undef);
GetOptions(
  'action=s' => \$action,
  'vm=s' => \$vmid
);
if (!defined($action) || !defined($vmid)) {
  print "Must specify action and VM ID\n";
  exit 1;
}
my $vmObj = new OpenApp::VMMgmt($vmid);
if (!defined($vmObj)) {
  print "Invalid VM ID '$vmid'\n";
  exit 1;
}

# OA dom0
if ($vmid eq $OpenApp::VMMgmt::OPENAPP_ID) {
  if ($action ne 'restart') {
    print "Invalid operation for '$vmid'\n";
    exit 1;
  }

  if (fork()) {
    # parent: return success
    exit 0;
  } else {
    # child: reboot
    fdRedirect();
    system('sleep 5 ; sudo /sbin/reboot >&/dev/null');
    exit 0;
  }
}

my $lv_cfg = $vmObj->getLibvirtCfg();
if (! -f "$lv_cfg") {
  print "Cannot find configuration for '$vmid'";
  exit 1;
}

sub waitVmShutOff {
  my $vm = shift;
  # max 180 seconds
  for my $i (0 .. 90) {
    sleep 2;
    my $st = `sudo virsh -c xen:/// domstate $vm`;
    last if ($st =~ /shut off/ || $st =~ /error: failed to get domain/);
  }
}

sub shutdownVm {
  my $vm = shift;
  system("sudo virsh -c xen:/// shutdown $vm");
  waitVmShutOff($vm);
  system("sudo virsh -c xen:/// destroy $vm");
}

if ($action eq 'start') {
  system("sudo virsh -c xen:/// create $lv_cfg");
  # this always returns -1
  exit 0;
} elsif ($action eq 'stop') {
  shutdownVm($vmid);
  exit 0;
} elsif ($action eq 'restart') {
  shutdownVm($vmid);
  system("sudo virsh -c xen:/// create $lv_cfg");
  exit 0;
}

exit 0;

