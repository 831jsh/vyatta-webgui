package OpenApp::VMDeploy;

use strict;
use POSIX;
use File::Temp qw(mkdtemp mkstemps);
use File::Copy 'mv';
use OpenApp::VMMgmt;
use Vyatta::Config;

my $VIMG_DIR = '/var/oa/vimg';
my $NVIMG_DIR = '/var/oa/vimg-new';
my $CVIMG_DIR = '/var/oa/vimg-critical';
my $IMG_DIR = '/var/oa/xen';
my $LDAP_ROOT = '/var/oa/ldap';
my $STATUS_FILE = 'current/status';
my $SCHED_FILE = 'current/sched';
my $HIST_FILE = 'current/hist';
my $RUNNING_FILE = 'current/running_meta';
my $BACKUP_SCRIPT = '/opt/vyatta/sbin/openapp-archive.pl';
my $BACKUP_ENV = "export OA_AUTH_USER=installer; export OA_SESSION_ID=vmd$$";
my $BACKUP_CMD = "$BACKUP_ENV; $BACKUP_SCRIPT";
my $OA_UPD_DIR = '/var/oa/oa-upd';
my $OA_NEW_DIR = "$OA_UPD_DIR/new"; 
my $OA_PREV_DIR = "$OA_UPD_DIR/prev";
my $OA_CUR_DIR = "$OA_UPD_DIR/current";

my $UPD_URG_CONTROL = 'OA-Update-Urgency';

my $CFG_CRITICAL_UPD_AUTO_INST_TIMEOUT
  = 'system open-app parameters upd-critical-install-timeout';

### "static" functions
sub isValidNewVer {
  my ($id, $ver) = @_;
  if (OpenApp::VMMgmt::isDom0Id($id)) {
    # dom0 special case
    return (-f "$OA_NEW_DIR/version_$ver") ? 1 : 0;
  }
  my $file = "$NVIMG_DIR/oa-vimg-${id}_${ver}_all.deb";
  return (-r "$file") ? 1 : 0;
}

sub isValidPrevVer {
  my ($id, $ver) = @_;
  if (OpenApp::VMMgmt::isDom0Id($id)) {
    # dom0 special case
    return (-f "$OA_PREV_DIR/version_$ver") ? 1 : 0;
  }
  my $file = "$VIMG_DIR/$id/prev/oa-vimg-${id}_${ver}_all.deb";
  return (-r "$file") ? 1 : 0;
}

sub vmCheckUpdate {
  my $vid = shift;
  my $dd = undef;

  if (OpenApp::VMMgmt::isDom0Id($vid)) {
    # dom0 special case
    # note: no critical update for dom0
    # use critical status to return warning instead
    my $bootv = OpenApp::VMMgmt::getDom0BootVer();
    my $grubv = OpenApp::VMMgmt::getDom0GrubDefVer();
    # cannot get version string (these should not happen)
    return ('', '') if (!defined($bootv) || !defined($grubv));
    my $msg = 'Restart OpenAppliance to complete previous update/restore '
              . "(running=$bootv, installed=$grubv)";
    return ('', $msg) if ("$bootv" ne "$grubv");

    # look for new ISO image
    my @v = ();
    if (opendir($dd, "$NVIMG_DIR")) {
      @v = grep { /\.iso$/ && -f "$NVIMG_DIR/$_" } readdir($dd);
      closedir($dd);
    }
    if (!defined($v[0])) {
      # no new ISO image. check the oa new directory for existing update.
      if (opendir($dd, "$OA_NEW_DIR")) {
        @v = grep { /^version_.*$/ && -f "$OA_NEW_DIR/$_" } readdir($dd);
        closedir($dd);
      }
      return ('', '') if (!defined($v[0]));
      # found existing update
      $v[0] =~ /^version_(.*)$/;
      return ($1, '');
    } else {
      # TODO handle multiple ISO images (should not happen).
      # for now, use the first one.
      my $new_iso = "$v[0]";
      # remove existing update (*.iso and version_*)
      _system("rm -f $OA_NEW_DIR/{*.iso,version_*}");
      # move new iso to oa new dir
      mv("$NVIMG_DIR/$new_iso","$OA_NEW_DIR");
      # remove any remaining iso in nvimg dir
      _system("rm -f $NVIMG_DIR/*.iso");
      # extract version string from iso and create version_ file
      my $new_file = "$OA_NEW_DIR/$new_iso";
      return ('', '') if (! -f "$new_file");
      my $new_ver
        = `sudo /opt/vyatta/sbin/get-iso-version "$new_file" 2>/dev/null`;
      my $fd;
      return ('', '') if (!open($fd, '>', "$OA_NEW_DIR/version_${new_ver}"));
      close($fd);
      return ($new_ver, '');
    }
  }

  opendir($dd, "$NVIMG_DIR") or return '';
  my @v = grep { /^oa-vimg-${vid}_.*\.deb$/
                 && -f "$NVIMG_DIR/$_" } readdir($dd);
  closedir($dd);
  return ('', '') if (!defined($v[0]));
  $v[0] =~ /^oa-vimg-${vid}_([^_]+)_all.deb$/;
  my ($ver, $crit) = ($1, '');
  if (isCriticalPkg($vid, $ver)) {
    my $dl = getCritUpdateDeadline($vid, $ver);
    if (!defined($dl)) {
      # not synced yet. return no update for now.
      $ver = '';
    } else {
      $crit = epoch2time($dl);
    }
  }
  return ($ver, $crit);
}

sub _checkSched {
  my ($vid) = @_;
  my $vdir = "$VIMG_DIR/$vid";
  
  if (OpenApp::VMMgmt::isDom0Id($vid)) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '<', "$sched_file") or return (undef, undef, undef, undef);
  my $data = <$fd>;
  close($fd);
  chomp($data);
  my ($sched, $job, $ver, $time) = split(/ /, $data, 4);
  return ($sched, $job, $ver, $time);
}

sub isValidSchedTime {
  my ($t) = @_;
  return (defined(time2epoch("$t"))) ? 1 : 0;
}

sub time2epoch {
  my ($t) = @_;
  if ($t eq 'now') {
    return time;
  }
  if (!($t =~ /^(\d+):(\d+) (\d+)\.(\d+)\.0?(\d)$/)) {
    return undef;
  }
  my ($h, $m, $D, $M, $Y) = ($1, $2, $3, $4, $5);
  return POSIX::strftime('%s', 0, $m, $h, $D, $M - 1, $Y + 100);
}

sub epoch2time {
  my ($e) = @_;
  return POSIX::strftime('%H:%M %d.%m.%y', localtime($e));
}

sub isCriticalPkg {
  my ($vid, $ver) = @_;
  if (OpenApp::VMMgmt::isDom0Id($vid)) {
    # no critical update for dom0
    return 0;
  }
  my $vimg = "$NVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  return 0 if (! -r "$vimg");
  my $urg = `dpkg-deb -f $vimg $UPD_URG_CONTROL`;
  chomp $urg;
  return (($urg =~ /^critical/) ? 1 : 0);
}

sub recordCriticalUpdate {
  my ($vid, $ver) = @_;
  my $vimg = "oa-vimg-${vid}_${ver}_all.deb";
  return if (! -r "$NVIMG_DIR/$vimg"); # package doesn't exist
  return if (-l "$CVIMG_DIR/$vimg"); # already recorded
  symlink("$NVIMG_DIR/$vimg", "$CVIMG_DIR/$vimg");
}

sub recordCriticalUpdates {
  my $uref = getUpdateList();
  for my $aref (@{$uref}) {
    my ($vmid, $ver) = @{$aref};
    next if (!OpenApp::VMMgmt::isValidId($vmid));
    next if (!isCriticalPkg($vmid, $ver));
    # we've got a critical update package.
    # record it, i.e., keep the receive time. if it's already recorded,
    # this should be nop.
    recordCriticalUpdate($vmid, $ver);
  }
}

sub _getCritUpdateInstallTimeout {
  my $cfg = new Vyatta::Config;
  $cfg->{_active_dir_base} = '/opt/vyatta/config/active';
  my $to = $cfg->returnOrigValue($CFG_CRITICAL_UPD_AUTO_INST_TIMEOUT);
  return (defined($to) ? ($to * 3600) : (24 * 3600));
}

sub getCritUpdateDeadline {
  my ($vid, $ver) = @_;
  my $ln = "$CVIMG_DIR/oa-vimg-${vid}_${ver}_all.deb";
  return undef if (! -l $ln);
  my $mtime = (lstat($ln))[9];
  return ($mtime + _getCritUpdateInstallTimeout());
}

sub getCritUpdateInstList {
  my $dd = undef;
  opendir($dd, "$CVIMG_DIR") or return [];
  my @V = grep { /^oa-vimg-.*\.deb$/
                 && -l "$CVIMG_DIR/$_" } readdir($dd);
  closedir($dd);

  my @ret = ();
  my $curtime = time;
  for my $v (@V) {
    my @st;
    if (!(@st = stat("$CVIMG_DIR/$v"))) {
      # update no longer there (probably installed). clean it up.
      unlink("$CVIMG_DIR/$v");
      next;
    }

    $v =~ /^oa-vimg-([^_]+)_([^_]+)_all.deb$/;
    my ($vid, $ver) = ($1, $2);
    
    my ($sched, $job, $sver, $time) = _checkSched($vid);
    # skip it if this particular version is already scheduled.
    next if ($sched eq 'Scheduled' && $sver eq $ver);
    # TODO define how to handle scenario where a different version is
    # scheduled. for now install the critical update anyway.

    my $dl = getCritUpdateDeadline($vid, $ver);
    next if (!defined($dl) || $curtime < $dl); # doesn't exist or not yet

    # the critical update was received more than X seconds ago (X is the
    # fixed interval for critical update auto install). return it to be
    # installed.
    push @ret, [ $vid, $ver ];
  }
  return \@ret;
}

sub getUpdateList {
  my $dd = undef;
  opendir($dd, "$NVIMG_DIR") or return [];
  my @V = grep { /^oa-vimg-.*\.deb$/
                 && -f "$NVIMG_DIR/$_" } readdir($dd);
  closedir($dd);
  my @ret = ();
  for my $v (@V) {
    $v =~ /^oa-vimg-([^_]+)_([^_]+)_all.deb$/;
    push @ret, [ $1, $2 ];
  }
  return \@ret;
}

sub installNewVM {
  my ($vid, $ver) = @_;
  my $vimg = "oa-vimg-${vid}_${ver}_all.deb";
  return "VM $vid version $ver does not exist" if (! -r "$NVIMG_DIR/$vimg");

  my $vdir = "$VIMG_DIR/$vid";
  # ignore any mkdir errors
  mkdir($vdir);
  mkdir("$vdir/current");
  mkdir("$vdir/prev");

  return "Failed to move package file: $!"
    if (!mv("$NVIMG_DIR/$vimg","$vdir/current"));

  # install package
  system("dpkg -i $vdir/current/$vimg");
  return "Failed to install package $vdir/current/$vimg" if ($? >> 8);
 
  # run postinst 
  return oaVimgPostinst($vid, 'NONE');
}

sub vmCheckPrev {
  my $vid = shift;
  my $dd = undef;
  if (OpenApp::VMMgmt::isDom0Id($vid)) {
    # dom0 special case
    opendir($dd, "$OA_PREV_DIR") or return '';
    my @v = grep { /^version_.*$/
                   && -f "$OA_PREV_DIR/$_" } readdir($dd);
    closedir($dd);
    return '' if (!defined($v[0]));
    $v[0] =~ /^version_(.*)$/;
    return "$1";
  }

  opendir($dd, "$VIMG_DIR/$vid/prev") or return '';
  my @v = grep { /^oa-vimg-${vid}_.*\.deb$/
                 && -f "$VIMG_DIR/$vid/prev/$_" } readdir($dd);
  closedir($dd);
  return '' if (!defined($v[0]));
  $v[0] =~ /^oa-vimg-${vid}_([^_]+)_all.deb$/;
  return "$1";
}

sub _inChroot {
  return (-r '/proc/version') ? 0 : 1;
}

my $ldap_init = '/etc/init.d/slapd';
sub _startLdapServer {
  # don't do it in chroot
  return undef if (_inChroot());

  my $cmd = "$ldap_init start";
  _system($cmd);
  return 'Cannot start LDAP server' if ($? >> 8);
  return undef;
}
sub _stopLdapServer {
  # don't do it in chroot
  return undef if (_inChroot());

  my $cmd = "$ldap_init stop";
  _system($cmd);
  return 'Cannot stop LDAP server' if ($? >> 8);
  return undef;
}

# LDAP-related postinst tasks
# $1: vmid
# $2: previous metadata file ('NONE' if new install)
sub _postinstLdap {
  my ($vid, $prev_meta) = @_;
  return undef if (OpenApp::VMMgmt::isDom0Id($vid)); # dom0 special case
  my $cur_meta = "$OpenApp::VMMgmt::META_DIR/$vid";
  
  # default (e.g., new install) assume prev ldapFormat is NONE
  my $prev_lform = 'NONE';
  if (defined($prev_meta) && $prev_meta ne 'NONE' && -r "$prev_meta") {
    my $prev = new OpenApp::VMMgmt($vid, $prev_meta);
    $prev_lform = $prev->getLdapFormat();
  }

  return 'Cannot find current VM metadata' if (! -r "$cur_meta");
  my $cur = new OpenApp::VMMgmt($vid, $cur_meta);
  my $cur_lform = $cur->getLdapFormat();
  
  if ($prev_lform eq 'NONE' && $cur_lform eq 'NONE') {
    # neither uses LDAP. done.
    return undef;
  }
 
  if ($prev_lform eq $cur_lform) {
    # both use LDAP and ldapFormat has not changed. no further action needed.
    return undef;
  }
 
  my $server_conf = '/etc/ldap/slapd.conf';
  my $domU_confdir = '/etc/ldap/domU';
  my $domU_conf = "$domU_confdir/$vid.conf";
  my $domU_dbdir = "/var/oa/ldap/$vid/db";
  my ($cmd, $err) = (undef, undef);
  
  if ($prev_lform ne 'NONE' && $cur_lform eq 'NONE') {
    # used LDAP before but now does not.
    ## remove generated config
    $cmd = "rm -f $domU_conf";
    _system($cmd);
    return 'Cannot remove domU LDAP configuration' if ($? >> 8);

    ## remove include from server config
    $cmd = "sed -i '/^# BEGIN $vid/,/^# END $vid/{d}' $server_conf"; 
    _system($cmd);
    return 'Cannot remove previous LDAP server config' if ($? >> 8);

    ## stop LDAP server
    $err = _stopLdapServer();
    return $err if (defined($err));

    ## remove sub-database
    $cmd = "rm -rf $domU_dbdir";
    _system($cmd);
    return 'Cannot remove domU LDAP sub-database' if ($? >> 8);
    
    ## start LDAP server
    $err = _startLdapServer();
    return $err if (defined($err));

    return undef;
  }

  # at this point there are two scenarios left.
  #   1. prev == NONE and cur != NONE (e.g., new install)
  #   2. neither is NONE and prev != cur (ldapFormat changed)
  
  # either way, generate the domU config first.
  my $ip = $cur->getIP();
  my $icfg = "$LDAP_ROOT/$vid/include.conf";
  my $ocfg = "$LDAP_ROOT/$vid/other.conf";
  my ($inc, $other) = ('', '');
  if (-r "$icfg") {
    $inc =<<EOF
include $icfg
EOF
  }
  if (-r "$ocfg") {
    $other =<<EOF
include $ocfg
EOF
  } else {
    $other =<<EOF;
index objectClass eq
access to *
  by peername.regex=IP:$ip write
EOF
  }

  if (! -d $domU_confdir) {
    mkdir($domU_confdir) or return 'Cannot create domU LDAP config directory';
  }

  my $fd = undef;
  open($fd, '>', $domU_conf) or return 'Cannot generate domU LDAP config';
  print $fd <<EOF;
database hdb
suffix "dc=$vid,dc=localdomain"
rootdn "cn=admin,dc=$vid,dc=localdomain"
directory "$domU_dbdir"
dbconfig set_cachesize 0 2097152 0
${inc}${other}
EOF
  close($fd);

  # add 'include' to server config
  $cmd = "sed -i '/^# BEGIN $vid/,/^# END $vid/{d}' $server_conf"; 
  _system($cmd);
  return 'Cannot remove previous LDAP server config' if ($? >> 8);
  open($fd, '>>', $server_conf) or return 'Cannot modify LDAP server config';
  print $fd <<EOF;
# BEGIN $vid
include $domU_conf
# END $vid
EOF
  close($fd);
  
  # stop LDAP server
  $err = _stopLdapServer();
  return $err if (defined($err));

  # remove sub-database if exists
  if (-d "$domU_dbdir") {
    $cmd = "rm -rf $domU_dbdir";
    _system($cmd);
    return 'Cannot remove domU LDAP sub-database' if ($? >> 8);
  }

  # create sub-database dir
  if (! -d $domU_dbdir) {
    mkdir($domU_dbdir) or return 'Cannot create domU LDAP sub-database';
  }

  # create initial db if it's new install and init.ldif is provided
  my $initdb = "$LDAP_ROOT/$vid/init.ldif";
  if ($prev_lform eq 'NONE' && -r "$initdb") {
    $cmd = "slapadd -b 'dc=$vid,dc=localdomain' -l $initdb";
    _system($cmd);
    return 'Cannot initialize domU LDAP sub-database' if ($? >> 8);
  }

  # set db permission
  $cmd = "chown -R openldap:openldap $domU_dbdir"; 
  _system($cmd);
  return 'Cannot set domU LDAP sub-database permissions' if ($? >> 8);
  
  ## start LDAP server
  $err = _startLdapServer();
  return $err if (defined($err));

  # done
  return undef;  
}

# notify lighttpd to reconfigure reverse proxy
sub notifyWuiProcess {
  my $LIGHTTPD_PID_FILE = '/var/run/lighttpd.pid';
  return if (! -r "$LIGHTTPD_PID_FILE");
  my $fd = undef;
  open($fd, '<', $LIGHTTPD_PID_FILE) or return;
  my $pid = <$fd>;
  close($fd);
  chomp($pid);
  system("sudo kill -USR2 '$pid'");
}

# WUI-related postinst tasks
sub _postinstWui {
  # notify lighttpd to reconfigure reverse proxy
  notifyWuiProcess();

#  _configureDomUAccess();
 
  # done 
  return undef;
}

sub _configureDomUAccess {
    my @VMs = OpenApp::VMMgmt::getVMList();

    my $fd_read;
    my $fd_write;
    if (open($fd_read, '<', "/etc/lighttpd/lighttpd.conf")) {
	#need to replace entry already there...
	if (open($fd_write, '>', "/etc/lighttpd/lighttpd.conf.lck")) {
	    my @in = <$fd_read>;
	    my $in;
	    my $write_out = "true";
	    for $in (@in) {
		if ($in =~ "^####vmaccesslist-start####") {
		    $write_out = "false";
		}
		elsif($in =~ "^####vmaccesslist-end####") {
		    $write_out = "true";
		    next;
		}
		if ($write_out eq "true") {
		    print $fd_write $in;
		}
	    }
	    #now prepend our vm access list section
	    print $fd_write "####vmaccesslist-start####\n";
	    my $vid;
	    for $vid (@VMs) {
		my $vm = new OpenApp::VMMgmt($vid);
		next if (!defined($vm));
		
		#need to escape out the ip address for perl processing
		my $domU = $vm->getIP();
		$domU =~ s/\./\\\./g;

		print $fd_write "\$HTTP[\"remoteip\"] !~ \"(".$domU.")\" {\n";
		print $fd_write "\t\$HTTP[\"url\"] =~ \"^/".$vm->getId()."-root/\" {\n";
		print $fd_write "\t\turl.access-deny = (\"\")\n";
		print $fd_write "\t}\n";
		print $fd_write "}\n";
	    }
	    print $fd_write "####vmaccesslist-end####\n";
	}
    }
    
    #now restart the server
    `cp /etc/lighttpd/lighttpd.conf.lck /etc/lighttpd/lighttpd.conf`;
    `/etc/init.d/lighttpd restart`;
}

# generic postinst tasks for oa-vimg packages
# $1: vmid
# $2: previous metadata file ('NONE' if new install)
# return error message or undef if success
sub oaVimgPostinst {
  my ($vid, $prev_meta) = @_;
  return undef if (OpenApp::VMMgmt::isDom0Id($vid)); # dom0 special case
  
  # remove previous image
  my $img = "$IMG_DIR/$vid.img";
  my $cmd = "rm -f $img";
  _system($cmd);
  return 'Failed to remove previous VM image' if ($? >> 8);

  # uncompress image
  my $gzimg = "$IMG_DIR/$vid.img.gz";
  return 'Compressed VM image not found' if (! -f "$gzimg");

  $cmd = "gzip -f -d $gzimg";
  _system($cmd);
  return 'Failed to extract new VM image' if ($? >> 8);

  # do LDAP-related tasks
  my $err = _postinstLdap($vid, $prev_meta);
  return $err if (defined($err));

  # do WUI-related tasks
  $err = _postinstWui();
  return $err if (defined($err));

  return undef;
}

my $debug_log = '';

sub _system {
  my $cmd = $_[0];
  if ("$debug_log" ne '') {
    $cmd .= " >>$debug_log 2>&1";
    my $fd = undef;
    if (open($fd, '>>', $debug_log)) {
      print $fd "$cmd\n";
      close($fd);
    }
  } else {
    $cmd .= ' >&/dev/null';
  }
  system($cmd);
}

### data
my %fields = (
  _vmId => undef
);

sub new {
  my ($that, $id) = @_;
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->{_vmId} = $id;
  return $self if (OpenApp::VMMgmt::isDom0Id($id)); # dom0 special case
  return ((-d "$VIMG_DIR/$id/current") ? $self : undef);
}

sub checkSched {
  my ($self) = @_;
  return _checkSched($self->{_vmId});
}

sub checkStatus {
  my ($self) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $st_file = "$vdir/$STATUS_FILE";
  my $fd = undef;
  open($fd, '<', "$st_file") or return (undef, undef, undef, undef);
  my $data = <$fd>;
  close($fd);
  chomp($data);
  my ($st, $ver, $t1, $t2, $msg) = split(/ /, $data, 5);
  return ($st, $ver, "$t1 $t2", $msg);
}

sub _getHistEntries {
  my ($self) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $hist_file = "$vdir/$HIST_FILE";
  my $fd = undef;
  open($fd, '<', "$hist_file") or return;
  my @ret = ();
  while (my $line = <$fd>) {
    chomp($line);
    my ($time, $id, $ver, $st, $msg) = split(/,/, $line, 5);
    push @ret, [ $time, $id, $ver, $st, $msg ];
  }
  close($fd);
  return \@ret;
}

sub _appendHist {
  my ($self, $time, $ver, $st, $msg) = @_;
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $hist_file = "$vdir/$HIST_FILE";
  my $fd = undef;
  open($fd, '>>', "$hist_file") or return;
  print $fd "$time,$self->{_vmId},$ver,$st,$msg\n";
  close($fd);
}

sub _saveSched {
  my ($self) = @_;
  my ($scheduled, $job, $ver, $time) = $self->checkSched();
  return if (!defined($scheduled));
  return if ($scheduled ne 'Canceled');
  # only save canceled entry
  $self->_appendHist($time, $ver, $scheduled, '');
}

sub _writeSched {
  my ($self, $sched, $job, $vver, $time) = @_;
  $self->_saveSched();
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '>', "$sched_file") or return;
  print $fd "$sched $job $vver $time\n";
  close($fd);
}

sub _saveStatus {
  my ($self) = @_;
  my ($st, $ver, $time, $msg) = $self->checkStatus();
  return if (!defined($st));
  return if ($st eq 'Upgrading' || $st eq 'Restoring');
  $self->_appendHist($time, $ver, $st, $msg);
}

sub _writeStatus {
  my ($self, $st, $vver, $time, $msg) = @_;
  $self->_saveStatus();
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $st_file = "$vdir/$STATUS_FILE";
  my $fd = undef;
  open($fd, '>', "$st_file") or return;
  print $fd "$st $vver $time $msg\n";
  close($fd);
}

sub _clearSched {
  my ($self) = @_;
  $self->_saveSched();
  my $vdir = "$VIMG_DIR/$self->{_vmId}";
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    $vdir = "$OA_UPD_DIR";
  }

  my $sched_file = "$vdir/$SCHED_FILE";
  my $fd = undef;
  open($fd, '>', "$sched_file") or return;
  close($fd);
}

sub sched {
  my ($self, $ver, $time) = @_;
  my ($scheduled) = $self->checkSched();
  return "'$self->{_vmId}' update already scheduled"
    if ($scheduled eq 'Scheduled');
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    my $bootv = OpenApp::VMMgmt::getDom0BootVer();
    my $grubv = OpenApp::VMMgmt::getDom0GrubDefVer();
    return 'Cannot schedule: Unknown current version' if (!defined($bootv));
    return 'Cannot schedule: Unknown default version' if (!defined($grubv));
    return 'Restart OpenAppliance to complete previous update/restore'
      if ("$bootv" ne "$grubv");
  }

  if (isCriticalPkg($self->{_vmId}, $ver)) {
    # critical update. make sure scheduled time is before the deadline.
    my $dl = getCritUpdateDeadline($self->{_vmId}, $ver);
    return "'$self->{_vmId}' cannot be scheduled at this time"
      if (!defined($dl)); # not synced yet
    my $stime = time2epoch($time);
    my $deadline = epoch2time($dl);
    if (!defined($stime) || $stime > $dl) {
      $time = $deadline;
    }
  }

  # schedule update
  my $upg_cmd = '/opt/vyatta/sbin/openapp-vm-upgrade.pl --action=upgrade '
                . " --vm=\"$self->{_vmId}\" --ver=\"$ver\"";
  my @atouts = `echo '$upg_cmd' | sudo at '$time' 2>&1 | grep -v warning`;
  my ($j, $t, $err) = (undef, undef, undef);
  for my $at (@atouts) {
    if ($at =~ /^job\s+(\d+)\s+at\s+(\w+\s+\w+\s+\d+\s+[\d:]+\s+\d+)$/) {
      ($j, $t) = ($1, $2);
      last;
    }
    $at =~ s/^at: //;
    $err .= $at;
  }
  return "Failed to schedule update: $err" if (!defined($j));
  my $tstr = `date -d '$t' +'%H:%M %d.%m.%y'`;
  chomp($tstr);

  $self->_writeSched('Scheduled', $j, $ver, $tstr);
  # success
  return undef;
}

sub cancel {
  my ($self) = @_;
  my ($scheduled, $job, $ver, $time) = $self->checkSched();
  return "No scheduled update for '$self->{_vmId}'"
    if ($scheduled ne 'Scheduled');
  
  # cancel update
  my $cmd = "sudo atrm '$job'";
  _system($cmd);
  return 'Failed to cancel scheduled update' if ($? >> 8);
 
  # record the cancel time
  $self->_writeSched('Canceled', '0', $ver, epoch2time(time()));
  # success
  return undef;
}

sub schedRestore {
  my ($self, $ver) = @_;
  my ($scheduled) = $self->checkSched();
  return "'$self->{_vmId}' update already scheduled"
    if ($scheduled eq 'Scheduled');

  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    my $bootv = OpenApp::VMMgmt::getDom0BootVer();
    my $grubv = OpenApp::VMMgmt::getDom0GrubDefVer();
    return 'Cannot restore: Unknown current version' if (!defined($bootv));
    return 'Cannot restore: Unknown default version' if (!defined($grubv));
    return 'Restart OpenAppliance to complete previous update/restore'
      if ("$bootv" ne "$grubv");
  }

  # schedule restore
  my $upg_cmd = '/opt/vyatta/sbin/openapp-vm-upgrade.pl --action=restore'
                . " --vm=\"$self->{_vmId}\" --ver=\"$ver\"";
  my @atouts = `echo '$upg_cmd' | sudo at now 2>&1 | grep -v warning`;
  my ($j, $t, $err) = (undef, undef, undef);
  for my $at (@atouts) {
    if ($at =~ /^job\s+(\d+)\s+at\s+(\w+\s+\w+\s+\d+\s+[\d:]+\s+\d+)$/) {
      ($j, $t) = ($1, $2);
      last;
    }
    $at =~ s/^at: //;
    $err .= $at;
  }
  return "Failed to initiate restore: $err" if (!defined($j));

  # remove sched entry
  $self->_clearSched();

  # success
  return undef;
}

sub getHist {
  my ($self) = @_;
  my @records = ();

  # get sched record
  my ($scheduled, $job, $ver, $time) = $self->checkSched();
  if (defined($scheduled)) {
    my %shash = (
                  _time => $time,
                  _id => "$self->{_vmId}",
                  _ver => "$ver",
                  _status => $scheduled,
                  _msg => ''
                );
    push @records, \%shash;
  }

  # get status record
  my ($st, $ver, $msg);
  ($st, $ver, $time, $msg) = $self->checkStatus();
  if (defined($st)) {
    my %shash = (
                  _time => $time,
                  _id => "$self->{_vmId}",
                  _ver => "$ver",
                  _status => $st,
                  _msg => $msg
                );
    push @records, \%shash;
  }

  my $href = $self->_getHistEntries();
  for my $aref (@{$href}) {
    my ($time, $id, $ver, $st, $msg) = @{$aref};
    my %shash = (
                  _time => $time,
                  _id => "$id",
                  _ver => "$ver",
                  _status => $st,
                  _msg => $msg,
                  _old => 1
                );
    push @records, \%shash;
  }

  return \@records;
}

# upgrade-specific pre-processing.
# return error message or undef if success.
sub _preUpgradeProc {
  my ($self, $vver) = @_;
  # write status
  my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
  $self->_writeStatus('Upgrading', $vver, $time, '');
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    return "Cannot find new update \"$vver\""
      if (! -f "$OA_NEW_DIR/version_$vver");

    # get the prev version
    my $dd = undef;
    my @v = ();
    if (opendir($dd, "$OA_PREV_DIR")) {
      @v = grep { /^version_.*$/ && -f "$OA_PREV_DIR/$_" } readdir($dd);
      closedir($dd);
    }
    if (defined($v[0])) {
      # found prev version. clean it up.
      $v[0] =~ /^version_(.*)$/;
      my $err = OpenApp::VMMgmt::cleanupDom0Ver($1);
      return "Failed to clean up previous version: $err" if (defined($err));
    }

    my $cmd = "rm -f $OA_PREV_DIR/version_*";
    _system($cmd);
    return 'Failed to remove previous version' if ($? >> 8);
    
    $cmd = "mv -f $OA_CUR_DIR/version_* $OA_PREV_DIR/";
    _system($cmd);
    return 'Failed to save current version' if ($? >> 8);

    $cmd = "rm -f $OA_CUR_DIR/*.iso";
    _system($cmd);
    return 'Failed to remove current ISO' if ($? >> 8);

    # there may not be an ISO if this was previously installed.
    # don't fail on error.
    $cmd = "mv -f $OA_NEW_DIR/*.iso $OA_CUR_DIR/";
    _system($cmd);

    $cmd = "mv -f $OA_NEW_DIR/version_* $OA_CUR_DIR/";
    _system($cmd);
    return 'Failed to move new update' if ($? >> 8);
    
    return undef;
  }

  # arrange new/current/prev packages
  my $new_pkg = "oa-vimg-$self->{_vmId}_${vver}_all.deb";
  my $new_dir = "$NVIMG_DIR";
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  my $prev_dir = "$VIMG_DIR/$self->{_vmId}/prev";
  
  my $cmd = "rm -f $prev_dir/oa-vimg-$self->{_vmId}_*_all.deb";
  _system($cmd);
  return 'Failed to remove previous package' if ($? >> 8);

  $cmd = "mv $cur_dir/oa-vimg-$self->{_vmId}_*_all.deb $prev_dir/";
  _system($cmd);
  return 'Failed to save current package' if ($? >> 8);

  $cmd = "mv $new_dir/$new_pkg $cur_dir/";
  _system($cmd);
  return 'Failed to move new package' if ($? >> 8);

  return undef;
}

# restore-specific pre-processing.
# return error message or undef if success.
sub _preRestoreProc {
  my ($self, $vver) = @_;
  # write status
  my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
  $self->_writeStatus('Restoring', $vver, $time, '');

  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    return "Cannot find previous version \"$vver\""
      if (! -f "$OA_PREV_DIR/version_$vver");

    my $cmd = "rm -f $OA_NEW_DIR/{version_*,*.iso}";
    _system($cmd);
    return 'Failed to clean up new update' if ($? >> 8);
    
    $cmd = "rm -f $OA_CUR_DIR/*.iso";
    _system($cmd);
    return 'Failed to clean up current version' if ($? >> 8);

    $cmd = "mv -f $OA_CUR_DIR/version_* $OA_NEW_DIR/";
    _system($cmd);
    return 'Failed to save current version' if ($? >> 8);

    $cmd = "mv -f $OA_PREV_DIR/version_* $OA_CUR_DIR/";
    _system($cmd);
    return 'Failed to move previous version' if ($? >> 8);
    
    return undef;
  }

  # arrange current/prev packages
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  my $prev_dir = "$VIMG_DIR/$self->{_vmId}/prev";
 
  # [spec change] current package goes back to being new update 
  my $cmd = "mv $cur_dir/oa-vimg-$self->{_vmId}_*_all.deb $NVIMG_DIR/";
  _system($cmd);
  return 'Failed to move current package' if ($? >> 8);
  
  $cmd = "mv $prev_dir/oa-vimg-$self->{_vmId}_${vver}_all.deb $cur_dir/";
  _system($cmd);
  return 'Failed to move prev package' if ($? >> 8);
  
  return undef;
}

# pre-install processing.
# return error message or undef if success.
# also return backup archive name if one was created.
sub _preInstProc {
  my ($self, $vver) = @_;

  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    # do backup
    my ($fh, $fname) = mkstemps('/tmp/upd-backup.XXXXXX', '.tar');
    close($fh);
    my $args = "--backup 'config=true' --filename '$fname'";
    my $err = `/opt/vyatta/sbin/openapp-dom0-backup.pl $args 2>&1`;
    if ($? >> 8) {
      unlink($fname);
      return ("Failed to create OA backup: $err", undef);
    }
    return (undef, $fname);
  }

  my $running = "$VIMG_DIR/$self->{_vmId}/$RUNNING_FILE";

  my $cmd = "rm -f $running";
  _system($cmd);
  return ('Failed to remove previous state file', undef) if ($? >> 8);
 
  # keep the metadata
  my $meta_file = "$OpenApp::VMMgmt::META_DIR/$self->{_vmId}";
  $cmd = "cp -p $meta_file $running";
  _system($cmd);
  return ('Failed to save current state file', undef) if ($? >> 8);

  # check if it is running 
  $cmd = "sudo virsh -c xen:/// domstate $self->{_vmId} >&/dev/null";
  _system($cmd);
  return ('Cannot backup VM', undef) if ($? >> 8);

  # check status
  my $vm = new OpenApp::VMMgmt($self->{_vmId});
  return ('Cannot backup VM', undef) if (!defined($vm)); # should not happen
  my $st = $vm->getState();
  return ('Cannot backup VM', undef) if ("$st" ne 'up');

  # VM is up. do backup.
  my ($fh, $fname) = mkstemps('/tmp/upd-backup.XXXXXX', '.tar');
  close($fh);
  my $bstr = "$self->{_vmId}:config,$self->{_vmId}:data";
  # note: the backup script has a timeout of 1 hour in case the domU
  # doesn't respond. i.e., this may block for 1 hour.
  my $err = `$BACKUP_CMD --backup-auto "$bstr" --file "$fname" 2>&1`;
  if ($? >> 8) {
    unlink($fname);
    return ("Failed to create VM backup: $err", undef);
  }

  # stop the VM
  OpenApp::VMMgmt::shutdownVM($self->{_vmId});
  if ($? >> 8) {
    unlink($fname);
    return ('Failed to stop VM', undef);
  }
    
  return (undef, $fname);
}

# install processing.
# return error message or undef if success.
sub _installProc {
  my ($self, $vver) = @_;
  
  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    return "Cannot find version \"$vver\" to install"
      if (! -f "$OA_CUR_DIR/version_$vver");

    my $dd = undef;
    my @v = ();
    if (opendir($dd, "$OA_CUR_DIR")) {
      @v = grep { /\.iso$/ && -f "$OA_CUR_DIR/$_" } readdir($dd);
      closedir($dd);
    }
    if (defined($v[0])) {
      # found a new iso. install it.
      my $err = `/opt/vyatta/sbin/install-image '$OA_CUR_DIR/$v[0]'`;
      return "Failed to install image: $err" if ($? >> 8);

      my $cmd = "rm -f $OA_CUR_DIR/*.iso";
      _system($cmd);
      return 'Failed to clean up current version' if ($? >> 8);
    }
    
    return undef;
  }

  my $new_pkg = "oa-vimg-$self->{_vmId}_${vver}_all.deb";
  my $cur_dir = "$VIMG_DIR/$self->{_vmId}/current";
  return 'Cannot find package to install' if (! -f "$cur_dir/$new_pkg");

  # install new package
  my $cmd = "dpkg -i $cur_dir/$new_pkg";
  _system($cmd);
  return 'Failed to install package' if ($? >> 8);

  return undef;
}

# post-install processing.
# return error message or undef if success.
sub _postInstProc {
  my ($self, $vver, $backup) = @_;

  if (OpenApp::VMMgmt::isDom0Id($self->{_vmId})) {
    # dom0 special case
    return "Cannot find version \"$vver\" after install"
      if (! -f "$OA_CUR_DIR/version_$vver");

    # set grub default to "current" (i.e., just installed)
    my $newdef = OpenApp::VMMgmt::setDom0GrubDefVer($vver);
    return 'Failed to set default boot entry' if (!defined($newdef));

    # restore
    my $args = "'$vver' '$backup'";
    my $err = `/opt/vyatta/sbin/openapp-dom0-restore-inst $args 2>&1`;
    my $ret = ($? >> 8);
    unlink($backup);
    return "Failed to restore OA backup: $err" if ($ret);
    
    return undef;
  }

  my $running = "$VIMG_DIR/$self->{_vmId}/$RUNNING_FILE";

  my $err = oaVimgPostinst($self->{_vmId}, $running);
  return $err if (defined($err));

  # start the VM
  OpenApp::VMMgmt::startVM($self->{_vmId});
  return 'Failed to start VM' if ($? >> 8);

  # check if it was running before install
  if (! -f "$running") {
    # wasn't running. done.
    return undef;
  }
  unlink($running) or return 'Failed to remove previous metadata';
  
  # check if backup exists
  return undef if (!defined($backup) || ! -f "$backup");
  
  ## need to check vendor/backupFormat. don't restore if different.
  
  # wait until VM can respond to restore command.
  ## need a mechanism to determine when a domU has finished booting.
  ## mechanism must work across all domUs. SNMP status may help, but, e.g.,
  ## on Vyatta UTM, SNMP is up before the whole config is loaded.
  for my $i (1 .. 10) {
    sleep 30;
    my $vm = new OpenApp::VMMgmt($self->{_vmId});
    return undef if (!defined($vm)); # should not happen
    my $st = $vm->getState();
    last if ("$st" eq 'up');
  }
  # XXX sleep some more. fixed amount of time fow now.
  sleep 180;
  
  # restore backup
  my $bstr = "$self->{_vmId}:config,$self->{_vmId}:data";

  #fix for release... mdl
  my @out = `sudo ls /var/archive/installer/tmp/backup/*.txt`;
  my $file =  $out[0];
  if (defined $file) {
      substr($file,-5) = ""; #remove '.tar'                                   
      my @tmp = split "/",$file;
      $file = $tmp[$#tmp];
  }
  else {
      $file = 'dummy';
  }

  #now move the file to the expected location:
  `cp $backup /var/archive/installer/$file.tar`;

  #patch is now done!

  my $args = "--restore '$file' --restore-target '$bstr' --file '$backup'";
  my $err = `$BACKUP_CMD $args 2>&1`;
  my $ret = ($? >> 8);
  unlink($backup);
  return "Failed to restore VM backup: $err" if ($ret);

  #patch 2: hack to remove
  `rm /var/archive/installer/$file.tar`;

  # done.
  return undef;
}

# perform upgrade. return error message or undef if success.
sub upgrade {
  my ($self, $vver) = @_;

  # remove sched entry
  sleep 3; # in case the scheduled task gets run before the "Scheduled"
           # is written.
  $self->_clearSched();

  my ($err, $backup) = (undef, undef);
  while (1) {
    $err = $self->_preUpgradeProc($vver);
    last if (defined($err));
    ($err, $backup) = $self->_preInstProc($vver);
    last if (defined($err));
    $err = $self->_installProc($vver);
    last if (defined($err));
    $err = $self->_postInstProc($vver, $backup);
    last;
  }
  if (defined($err)) {
    # error. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Succeeded', $vver, $time, "Upgrade $vver succeeded");
    return undef;
  } 
}

# perform restore. return error message or undef if success.
sub restore {
  my ($self, $vver) = @_;

  # remove sched entry
  $self->_clearSched();

  my ($err, $backup) = (undef, undef);
  while (1) {
    $err = $self->_preRestoreProc($vver);
    last if (defined($err));
    ($err, $backup) = $self->_preInstProc($vver);
    last if (defined($err));
    $err = $self->_installProc($vver);
    last if (defined($err));
    $err = $self->_postInstProc($vver, $backup);
    last;
  }
  if (defined($err)) {
    # error. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Failed', $vver, $time, $err);
    return $err;
  } else {
    # success. write status.
    my $time = POSIX::strftime('%H:%M %d.%m.%y', localtime());
    $self->_writeStatus('Restored', $vver, $time, "Restore $vver succeeded");
    return undef;
  } 
}

1;
