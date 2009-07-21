package OpenApp::LdapUser;

use strict;
use File::Temp qw(mkstemp);
use Net::LDAP qw(LDAP_NO_SUCH_ATTRIBUTE);

### constants
my $OA_LDAP_SERVER = 'ldap://localhost';
my $OA_LDAP_SUFFIX = 'dc=localhost,dc=localdomain';
my $OA_LDAP_USER_SUFFIX = "ou=People,$OA_LDAP_SUFFIX";
my $OA_LDAP_ROOTDN = "cn=admin,$OA_LDAP_SUFFIX";
my $OA_LDAP_ROOT_PASSWORD_FILE = '/etc/ldap.secret';
my $OA_LDAP_READDN = undef;
my $OA_LDAP_READ_PASSWORD = undef;
my $OA_LDAP_ATTR_UID = 'uid';
my $OA_LDAP_ATTR_MAIL = 'mail';
my $OA_LDAP_ATTR_LAST = 'sn';
my $OA_LDAP_ATTR_FIRST = 'cn';
my $OA_LDAP_ATTR_RIGHT = 'memberUid';
my $OA_LDAP_ATTR_ROLE = 'description';
my $OA_LDAP_ATTR_PASSWORD = 'userPassword';

### "static" functions
sub listAllUsers {
  # set up LDAP
  my $ldap = Net::LDAP->new("$OA_LDAP_SERVER");
  return [] if (!defined($ldap));
  my $res;
  if (!defined($OA_LDAP_READDN)) {
    # bind anonymously
    $res = $ldap->bind();
  } else {
    # bind with readonly credential
    $res = $ldap->bind("$OA_LDAP_READDN",
                       password => "$OA_LDAP_READ_PASSWORD");
  }
  if ($res->is_error()) {
    # bind failed
    $ldap->disconnect();
    return [];
  }

  # do query
  $res = $ldap->search(base => "$OA_LDAP_USER_SUFFIX",
                       filter => "$OA_LDAP_ATTR_UID=*",
                       attrs => [ "$OA_LDAP_ATTR_UID" ]);
  if ($res->is_error()) {
    $ldap->disconnect();
    return [];
  }
  my @ret = ();
  for my $ent ($res->entries()) {
    my $uid = $ent->get_value($OA_LDAP_ATTR_UID);
    next if (!defined($uid));
    push @ret, $uid;
  }
  $ldap->disconnect();
  return \@ret;
}

sub _setupRootBind {
  # set up LDAP (with root bind)
  my $ldap = Net::LDAP->new("$OA_LDAP_SERVER");
  return undef if (!defined($ldap));
  my $rpw = `sudo cat $OA_LDAP_ROOT_PASSWORD_FILE 2>/dev/null`;
  if ($? >> 8) {
    $ldap->disconnect();
    return undef;
  }
  chomp($rpw);
  my $res = $ldap->bind("$OA_LDAP_ROOTDN", password => "$rpw");
  if ($res->is_error()) {
    $ldap->disconnect();
    return undef;
  }
  return $ldap;
}

sub _deleteUserAttr {
  my ($user, $attr) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          delete => [ $attr ]);
  $ldap->disconnect();
  return undef if (!$res->is_error()
                   || $res->code() == LDAP_NO_SUCH_ATTRIBUTE());
  return 'Failed to delete user attribute';
}

sub _replaceUserAttr {
  my ($user, $attr, $value) = @_;
  my $ldap = _setupRootBind();
  return 'Failed to bind to LDAP database' if (!defined($ldap));
  my $res = $ldap->modify("$OA_LDAP_ATTR_UID=$user,$OA_LDAP_USER_SUFFIX",
                          replace => { "$attr" => "$value" });
  $ldap->disconnect();
  return 'Failed to replace user attribute' if ($res->is_error());
  return undef;
}

### data
my %fields = (
  _ldapObj => undef,
  _uname => undef,
  _umail => undef,
  _ulast => undef,
  _ufirst => undef,
  _urights => undef,
  _urole => undef
);

sub _setup {
  my ($self, $uname) = @_;
  $self->{_uname} = $uname;
 
  # special case for installer
  if ($uname eq 'installer') {
    $self->{_urole} = 'installer';
    $self->{_urights} = {};
    return;
  }

  # set up LDAP
  $self->{_ldapObj} = Net::LDAP->new("$OA_LDAP_SERVER");
  return if (!defined($self->{_ldapObj}));
  my $res;
  if (!defined($OA_LDAP_READDN)) {
    # bind anonymously
    $res = $self->{_ldapObj}->bind();
  } else {
    # bind with readonly credential
    $res = $self->{_ldapObj}->bind("$OA_LDAP_READDN",
                                   password => "$OA_LDAP_READ_PASSWORD");
  }
  if ($res->is_error()) {
    # bind failed
    $self->{_ldapObj}->disconnect();
    $self->{_ldapObj} = undef;
    return;
  }

  # do query
  $res = $self->{_ldapObj}->search(base => "$OA_LDAP_USER_SUFFIX",
                                   filter => "$OA_LDAP_ATTR_UID=$uname");
  return if ($res->is_error());
  return if ($res->count() != 1);
  my $entry = $res->entry(0);
  $self->{_umail} = ($entry->get_value($OA_LDAP_ATTR_MAIL))[0];
  $self->{_ulast} = ($entry->get_value($OA_LDAP_ATTR_LAST))[0];
  $self->{_ufirst} = ($entry->get_value($OA_LDAP_ATTR_FIRST))[0];
  $self->{_urole} = ($entry->get_value($OA_LDAP_ATTR_ROLE))[0];
  my %rights = ();
  map { $rights{$_} = 1 } $entry->get_value($OA_LDAP_ATTR_RIGHT);
  $self->{_urights} = \%rights;
}

sub new {
  my ($that, $uname) = @_;
  my $class = ref ($that) || $that;
  my $self = {
    %fields,
  };

  bless $self, $class;
  $self->_setup($uname);
  return $self;
}

### getters for user attributes
sub getName {
  my ($self) = @_;
  return $self->{_uname};
}

sub getMail {
  my ($self) = @_;
  return $self->{_umail};
}

sub getLast {
  my ($self) = @_;
  return $self->{_ulast};
}

sub getFirst {
  my ($self) = @_;
  return $self->{_ufirst};
}

sub getRights {
  my ($self) = @_;
  # this is a hashref
  return $self->{_urights};
}

sub getRole {
  my ($self) = @_;
  return $self->{_urole};
}

sub passwordExists {
  my ($self) = @_;
 
  # special case for installer
  return 1 if ($self->{_uname} eq 'installer');

  my $ldap = _setupRootBind();
  my $ret = 0;
  while (defined($ldap)) {
    my $res;
    $res = $ldap->search(base => "$OA_LDAP_USER_SUFFIX",
                         filter => "$OA_LDAP_ATTR_UID=$self->{_uname}",
                         attrs => [ "$OA_LDAP_ATTR_PASSWORD" ]);
    last if ($res->is_error());
    last if ($res->count() != 1);
    my $entry = $res->entry(0);
    $ret = (defined($entry->get_value($OA_LDAP_ATTR_PASSWORD)) ? 1 : 0);
    last;
  }
  $ldap->disconnect() if (defined($ldap));
  return $ret;
}

### setters for user attributes
sub deletePassword {
  my ($self) = @_;
  return _deleteUserAttr($self->{_uname}, $OA_LDAP_ATTR_PASSWORD);
}

sub setPassword {
  my ($self, $newpass) = @_;
  my ($fh, $fname) = mkstemp('/tmp/oaldapuser.XXXXXX');
  chmod(0600, $fname);
  print $fh "$newpass";
  close($fh);
  my $ep;
  if (!open($ep, '-|', "/usr/sbin/slappasswd -T '$fname' 2>/dev/null")) {
    unlink($fname);
    return 'Failed to encrypt new password';
  }
  my $epass = <$ep>;
  close($ep);
  unlink($fname);
  chomp($epass);
  return _replaceUserAttr($self->{_uname}, $OA_LDAP_ATTR_PASSWORD, $epass);
}

1;

