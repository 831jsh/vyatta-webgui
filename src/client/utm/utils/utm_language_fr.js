/*;;;
    Document   ; utm_language_en.js;;
    Created on ; Mar 23, 2009, 2;18;11:00 PM
    Author     ; Kevin.Choi;;
    Description;;;
*/

var g_lang =
{
    ///////////////////////////////////////////////////////////////////;English;French;
    // Menu;;;
    m_menu_dashboard : "tableau de bord", 
    m_menu_des_dashboard : "tableau de bord s�curit�",
    m_menu_firewall : "pare-feu", 
    m_menu_des_firewall : "pare-feu", 
    m_menu_idp : "pr�vention d'intrusion", 
    m_menu_des_idp : "pr�vention d'intrusion", 
    m_menu_avs : "anti-virus", 
    m_menu_des_avs : "anti-virus", 
    m_menu_asp : "anti-spam", 
    m_menu_des_asp : "anti-spam", 
    m_menu_webf : "filtrage web",
    m_menu_des_webf: "filtrage web",
    m_menu_imp2p : "filtrage MI & P2P",
    m_menu_des_imp2p : "filtrage MI & P2P", 
    m_menu_vpn : "VPN", 
    m_menu_des_vpn : "VPN", 
    m_menu_log : "logs", 
    m_menu_des_log : "logs", 
	m_menu_basic_log: "basic",
	m_menu_des_basic_log: "basic",	
	m_menu_advanced_log: "advanced",
	m_menu_des_advanced_log: "advanced",		
    m_menu_zone_mgt : "gestion des zones", 
    m_menu_des_zone_mgt : "gestion des zones", 
    m_menu_easy_mode : "mode facile", 
    m_menu_des_easy_mode : "mode facile", 
    m_menu_expert_mode : "mode expert", 
    m_menu_des_expert_mode : "mode expert", 
    m_menu_easy_filtering : "mode facile", 
    m_menu_des_easy_filtering : "mode facile", 
    m_menu_expert_filtering : "mode expert", 
    m_menu_des_expert_filtering : "mode expert", 
    m_menu_overview : "overview", 
    m_menu_des_overview : "overview",
    m_menu_s2s : "site � site", 
    m_menu_des_s2s : "site � site", 
    m_menu_remote_users : "utilisateurs nomades", 
    m_menu_des_remote_users : "utilisateurs nomades", 
    m_menu_des_add_zone : "ajouter une zone", 
    m_menu_des_update_zone : "modifier une zone", 
    m_menu_des_custom_firewall : "pare-feu personnalis�", 
    m_menu_des_authorized_urls : "URLs autoris�es", 
    m_menu_des_ban_keyword : "mots interdits dans URL",

    ///////////////////////////////////////////////////////////////////;;
    // Network configuration menu    ;;
    m_menu_lan_multi : "LAN / multi LAN", 
	m_menu_lan : "LAN",
	m_menu_des_lan : "LAN/IP parameters",
	m_menu_lan2: "LAN2",
	m_menu_des_lan2 : "LAN2/IP parameters",
	m_menu_dmz : "DMZ", 
	m_menu_nat_pat : "NAT/PAT", 
	m_menu_csc_router : "routeur cascad�", 
	m_menu_des_csc_router : "routeur cascad�", 
	m_menu_dns : "DNS", 
    m_menu_port_config : "param�trage des ports", 
	m_menu_des_port_config : "param�trage des ports", 

    ///////////////////////////////////////////////////////////////////;;
    // Dash board screen;;
    m_db_firewall: "pare-feu",
    m_db_intrusion: "pr�vention d'intrusion",
    m_db_webFiltering: "filtrage web",
    m_dbActivated: "activ�e",
    m_dbDeactivated: "D�sactiv�",
    m_db_fwProfile: "profil de s�curit�",
    m_db_fwTop5: "top 5 des services bloqu�",
    m_db_fwService: "service",
    m_db_fwNoOfBlock: "nombre<br>de<br>blocs" ,
    m_db_fwLastBlock: "date de<br>dernier<br>bloc",
    m_db_vpnSite2Site: "site to site",
    m_db_vpnS2sConfig: "site to site connections configured",
    m_db_vpnS2sUpRunning: "site to site connections up and running",
    m_db_vpnRuConfig: "number of remote users configured",
    m_db_vpnRuConnected: "number of remote users connected",
    m_db_lastUpdate: "derni�re mise � jour",
    m_db_ipNumOfAtBlock: "nombre d'attaques bloqu�es",
    m_db_ipAttackAlert: "attaque d'alerte",
    m_db_webViolation: "violation a �t� commise",


    ////////////////////////////////////////////////////////////////////;;
    // common;;
    m_tableTooltip1 : "cliquez ici pour trier", 
    m_name : "nom", 
    m_enabled : "activer",
    m_delete : "supprimer",
    m_group : "groupe",
    m_username : "utilisateur",
    m_status : "statut",
	m_duplicate :'duplicata',	
    m_ipAddr : "adresse IP",
	m_macAddr: 'MAC adresse',	
    m_invalidIpAddr : "IP adresse non valide",
    m_invalidNetmask : "netmask non valide",
    m_ipaddrTitle : "IP adresse validation", 
    m_underConstruction : "en construction",
    m_applyTip : "sauvegarder les modifications",
    m_cancelTip : "annuler les modifications", 
    m_applyError : "appliquer erreur",
    m_deleteError : "supprimer erreur",
    m_resetError : "r�initialisation d'erreur",
    m_cancelError : "annuler l'erreur",
    m_setError : "erreur de",
    m_confModify : "les modifications effectu�es n'ont pas �t� sauvegard�es. Voulez-vous continuer ?",

    m_formNotAValidIP: " is not a valid IP address",
	m_formNotAValidMac: " is not a valid MAC address",
	m_formFixError: "Please fix the following errors:",
    m_formNoEmpty : "cannot be empty",	
    m_formNoSpace : "cannot contain space character",
	
    ///////////////////////////////////////////////////////////////////;;
    // VPN Overview;;
    m_vpnOVSource : 'source',
    m_vpnOVDest : 'destination',
    m_vpnOVPeerDomainName : "adresse du site distant / nom de domaine",
    m_vpnOVConfMode : 'mode de configuration',
    m_vpnOVLocal : 'locales',
    m_vpnOVS2S : "connexions site � site",
    m_vpnOVRemote : "utilisateurs nomades",
    m_vpnDeleteConfirm  : "etes-vous s�r de vouloir supprimer",
    m_vpnDeleteTitle : "supprimer VPN",

    ///////////////////////////////////////////////////////////////////
    // VPN RemoteUser View
    m_vpnRemoteviewHeader : "This page enables you to configure a Virtual " +
        "Private Network (VPN) Server to connect remote users.",
    m_vpnDeleteGropuTitle : "supprimer le groupe utilisateur distant",
    m_vpnDeleteUserTitle : "supprimer un utilisateur distant",

    ///////////////////////////////////////////////////////////////////;;
    // Firewall Security Level;;
    m_fireActiveHeader : "Zone Active Tableau",	
    m_fireLevelColName : "niveaux de s�curit�",
    m_fireLevelColSelect : "s�lectionner", 
    m_fireLevelColDir : "direction", 
    m_fireLevelColFrom : "de",
    m_fireLevelColTo : "vers",
    m_fireLevelHdDef : "Default",	
    m_fireLevelBdDef : "tout le trafic est bloqu�",	
    m_fireLevelHdAuth : "faible", 
    m_fireLevelBdAuth : "fonctionnalit�s de pare-feu est d�sactiv�. Tout le trafic est autoris�.", 
    m_fireLevelHdStand : "moyen", 
    m_fireLevelBdStand : "permet � tous les services, sauf Netbios (ports 135, 137, 138, 139 and 445).",
    m_fireLevelHdAdvan : "�lev�", 
    m_fireLevelBdAdvan : "seuls les services Web et mail sont autoris�s depuis votre r�seau local",
    m_fireLevelHdCustom : "personnalis�",
    m_fireLevelBdCustom : "personnalisation du profil �lev�",
    m_fireLevelHdBlock : "bloquer tout", 
    m_fireLevelBdBlock : "bloque tout le trafic de donn�es. Seul le trafic voix est autoris�e", 
    m_fireLevelCustConfTip : "personnaliser votre niveau de s�curit�", 
    m_fireLevelApplyTip : "sauvegarder les modifications", 
    m_fireLevelCancelTip : "annuler les modifications", 

    ///////////////////////////////////////////////////////////////////;;
    // Firewall Zone Management;;
    m_fireZMAddTip : "cr�er une nouvelle zone",
    m_fireZMApplyTip : "sauvegarder les modifications",
    m_fireZMZoneName : "nom de la zone", 
    m_fireZMMember : "membres de la zone", 
    m_fireZMMemIncluded : "inclus", 
    m_fireZMMemAvail : "disponible", 
    m_fireZMDesc : "description",
    m_fireZMEnable : "activer", 
    m_fireZMMemIncTip : "Double cliquer sur l'�l�ment s�lectionn� pour l'enlever de la zone", 
    m_fireZMMemAvailTip : "Double cliquer sur l'�l�ment s�lectionn� pour l'inclure dans la zone", 
    m_fireZMMemError : "le champ membre(s) ne peut pas rester vide. Veuillez au moins en s�lectionner un.", 
    m_fireZMNameError : "le champ nom de la zone ne peut rester vide.",

    ///////////////////////////////////////////////////////////////////
    // Firewall Security Customize Level;;
    m_fireCustTitle : "Customized firewall",
    m_fireDeleteConfirm : "Etes-vous s�r de vouloir supprimer cette r�gle ?",
    m_fireCustDeleteConfirmHeader : "supprimer",
    m_discardConfirm : "Vous aller effacer toutes les modifications effectu�es. Etes vous s�r de vouloir annuler ?", 
    m_fireCustDiscardConfirmHeader : "Effacer tous les changements?", 
    m_fireResetConfirm : "Vous allez recharger ",
    m_fireCustResetConfirmHeader : "Reset Customize Rules", 
    m_fireCustSubHeader : "r�gles sp�cifiques",
    m_fireCustRuleNo : "r�gle<br>nombre", 
    m_fireCustDirection : "direction", 
    m_fireCustAppService : "application<br>/service",
    m_fireCustProtocol : "protocole", 
    m_fireCustSrcIpAddr : "adresse IP<br>d'origine", 
    m_fireCustSrcMaskIpAddr : "masque<br>d'origine", 
    m_fireCustSrcPort : "port d'origine<small><br>port or<br>plage<br>(200-300)</small>", 
    m_fireCustDestIpAddr : "adresse IP<br>de destination", 
    m_fireCustDestMaskIpAddr : "masque de destination", 
    m_fireCustDestPort: "port de destination<small><br>port or<br>plage<br>(200-300)</small>", 
    m_fireCustInternIpAddr : "internes IP<br>Adresse<small><br>c�libataire IP or an IP<br>range</small>", 
    m_fireCustInternPort : "internal<br>port<small><br>Enter single<br>port number <br>or port range<br>(200-300)</small>",
    m_fireCustAction : "action", 
    m_fireCustLog : "log",
    m_fireCustOrder : "ordre", 
    m_fireCustEnable : "activer", 
    m_fireCustDelete : "supprimer",
    m_fireCustRuleOption  : "Affichage des r�gles par direction", 
    m_fireCustApplyTip : "sauvegarder les modifications", 
    m_fireCustCancelTip : "annuler les modifications", 
    m_fireCustResetTip : "r�initialiser", 
    m_fireCustBackTip : "retour � la page pr�c�dente", 
    m_fireCustAddTip : "ajouter une nouvelle r�gle",
    m_fireCustLogEnabled : "Log is enabled",
    m_fireCustEnableEnabled : "Enable field is enabled",
    m_fireCustDeleteNotAllow : "Delete is not allowed",	
    m_fireCustLimitation : "You have reached the limit for the number of rules you can create.",
    m_fireCustOrderUpTip : "move up by one",
    m_fireCustOrderDnTip : "move down by one",

    ////////////////////////////////////////////////////////////////////;;
    // network configuration NAT/PAT;;
    m_nwNatPatHeader :  "Cette page vous permet de param�trer des r�gles de NAT/PAT."  + 
                        "Saisir un num�ro de port unique ou une plage de ports (ex: 200-300)" + 
                        "Assurez-vous de ne pas avoir filtr� ces ports dans le pare-feu.",
    m_nwTitle : "NAT/PAT",
    m_nwDestPortErr : "Invalid destination port.",
    m_nwProtocolErr : "Invalid protocol.",
    m_nwInternalAddrErr : "Invalid internal IP address.",
    m_nwAppServiceErr : "Invalid application service.",

    ////////////////////////////////////////////////////////////////////;;
    // network configuration Routing;;
    m_nwRoutHeader : "Cette page vous permet de configurer une table de routage statique.",
    m_nwRoutDestNetwork : "r�seau de destination",
    m_nwRoutDestNwMask : "masque du r�seau de destination", 
    m_nwRoutConf : "configurer l'option", 
    m_nwRoutGwInterface : "interface de<br>l'Open Appliance", 
    m_nwGateway : "gateway",
    m_nwRoutMetric : "m�trique",


    ///////////////////////////////////////////////////////////////////;;
    // VPN General;;
    m_vpn_BasicSettings : "param�tres de base", 
	m_vpn_auth : "authentification", 
	m_vpn_TunnelSettings : "param�tres du tunnel", 
	m_vpn_TunnelConfigMode : "mode de configuration",
	m_vpn_PresharedKey : "clef partag�e", 
	m_vpn_Confirm : "confirmer", 
    m_vpn_IKEnegPhase1 : "n�gociation IKE (Phase 1)",
    m_vpn_IKE_p1_proto : "type/protocole", 
    m_vpn_IKE_p1_ex_mode : "mode d'�change",
    m_vpn_Encrypt : "cryptage", 
    m_vpn_Diffle : "groupe Diffie Hellmann", 
    m_vpn_LifeTime : "dur�e de vie (en secondes)", 
    m_vpn_IKEphase2 : "IKE (Phase 2)", 
	m_vpn_LocalNetwork : "r�seau local", 
	m_vpn_RemoteNetwork : "r�seau distant",
	m_vpn_EZ : "facile",
	m_vpn_Expert : "expert",
    m_vpn_DFS : "groupe DFS",
	m_vpn_Users : "utilisateurs",
    m_vpn_LifeTime_outofrange: " has to be in the range from 30 to 86400 seconds",	

    ///////////////////////////////////////////////////////////////////;;
    // VPN Site 2 Site;;
    m_vpnS2S_VpnConSettings : "param�tres de connexion VPN", 

    m_vpnS2S_TunnelName : "nom du tunnel", 
	m_vpnS2S_DomainName : "adresse du site distant / nom de domaine", 
	m_vpnS2S_RemoteVPNdevice : "�quipement VPN du site distant", 
	m_vpnS2S_preshareKey_confirm_mismatch : "preshared key does not match with confirm preshared key",
	m_vpnS2S_error_missing_required_field : "Missing required fields",
	m_vpnS2S_error_failure_configure : "Fail to set up the vpn configuration",
	m_vpnS2S_error_peerip_exists : "The peer IP already exists with a different tunnel",	

    ///////////////////////////////////////////////////////////////////;;
    // VPN Remote User Group;;
    m_vpnRUG_GroupSettings : "param�tres du groupe", 
    m_vpnRUG_ProfileName : "nom du groupe", 
    m_vpnRUG_VPNsoft : "logiciel VPN", 
    m_vpnRUG_UsrSettings : "param�tres utilisateurs", 
    m_vpnRUG_IPAlloc : "attribution d'adresses IP", 
	m_vpnRUG_ipstart : "start range",
	m_vpnRUG_ipend: "end range",	
    m_vpnRUG_InternetAccess : "acc�s internet",
	m_vpnRUG_range_invalid: "end range must be greater than start range!",
	m_vpnRUG_from_OA: "through the Open Appliance",
	m_vpnRUG_transport_natt_esp: "transport with NAT-T/ ESP",
	m_vpnRUG_main: "main",
    m_vpnRUG_group_2_5: "group 2/ group 5",	
    m_vpnRUG_static: "static",	

    ///////////////////////////////////////////////////////////////////;;
    // VPN Remote User Add;;
    m_vpnRUadd_RemoteUserSettings : "param�tres utilisateur nomade",
    m_vpnRUadd_UserName : "nom d'utilisateur",
    m_vpnRUadd_UserPasswd : "mot de passe d'utilisateur ",
    m_vpnRUadd_VPNGroup : "groupe VPN",
	m_vpnRUadd__confirm_mismatch : "user password does not match with confirm user password",
    m_vpnRUadd_requireGroup	: "You cannot add a user when there is no group",

	///////////////////////////////////////////////////////////////////
    // URL Filtering;;
    m_url_ezByCat : "par cat�gorie", 
    m_url_ezLegal : "l�gale",
    m_url_ezProf : "professionnelle",
    m_url_ezStrict : "stricte", 
    m_url_ezByUrl : "par URLs autoris�es",
    m_url_ezByWord : "par mots interdits dans les URLs",
    m_url_ezFilterPolicy : "politique de filtrage",
    m_url_ezFilterPolicyImp : "application de la politique de filtrage",
    m_url_ezDay : "jour",
    m_url_ezDayArray: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    m_url_ezTime : "plage horaire", 
    m_url_ezAlways : "filtrage", 
    m_url_ezOn : "activ�", 
	m_url_ezOff : "d�sactiv�", 
	m_url_ezWebSiteAddress : "adresses de sites web", 
    m_url_ezBannedKeywordInUrl : "mots interdits dans URLs", 
	m_url_expertSubscribeP1 : "Ce mode est seulement disponible avec la brique de service UTM Orange fournie par Netasq.<br/><br/>" + 
	                          "Cette mode vous permettra de :",
    m_url_ezDeleteConfirm : "Etes-vous s�r de vouloir supprimer cette ligne?", 
    m_url_ezPolicyDisableConfirm : "Vous n'avez s�lectionner aucune option de politique de filtrage. Etes-vous s�r de ne pas vouloir param�trer cette fonction ?", 
	m_url_ezBLsubUnSelected : "Merci de bien vouloir s�lectionner au moins une cat�gorie",
	m_url_ezConfigureWL : "Param�trer les URLs autoris�es", 
	m_url_ezConfigureKeyword : "Param�trer les mots interdits dans les URLs",

	m_url_expertSubscribeListItem1 : "b�n�ficier de cat�gories d'URL enrichies que vous pouvez aussi personnaliser.",
	m_url_expertSubscribeListItem2 : "appliquer une politique de filtrage sp�cifique par groupe d'utilisateurs",
	m_url_expertSubscribeListItem3 : "combiner les diff�rentes fonctions de filtrage propos�es (cat�gories / URLs autoris�es / mots interdits).",
	m_url_expertSubscribeP2 : "Pour obtenir ces services avanc�s, veuillez cliquer sur le bouton \"souscrire\" ci-dessous.",

	///////////////////////////////////////////////////////////////////";;
    // IDS/IPS;;
	m_ids_Subscribe : "Ce mode est seulement disponible avec la brique de service UTM Orange fournie par Netasq.<br/><br/>" +
	                  "Cette mode vous permettra de b�n�ficier d'une base de signatures IDS /IPS enrichie que vous pourrez aussi personnaliser.<br/><br/>",

    m_ids_ezEnable : "Pour obtenir ces services avanc�s, veuillez cliquer sur le bouton \"souscrire\" ci-dessous.",

	///////////////////////////////////////////////////////////////////";;
    // Anti-virus;;
	m_avs_Subscribe : "La protection anti-virus (pour PCs / ordinateurs portables et serveurs)  est seulement disponible avec la brique de service UTM Orange fournie par Netasq.<br/><br/>" + 
					  "Pour obtenir cette protection, veuillez cliquer sur le bouton \"souscrire\" ci-dessous.",

	///////////////////////////////////////////////////////////////////";;
    // Anti-spam;;
	m_asm_Subscribe : "La protection anti-spam (pour PCs / ordinateurs portables et serveurs)  est seulement disponible avec la brique de service UTM Orange fournie par Netasq.<br/><br/>" + 
					  "Pour obtenir cette protection, veuillez cliquer sur le bouton \"souscrire\" ci-dessous.",

	///////////////////////////////////////////////////////////////////";;
    // IM&P2P filtering;;
	m_imp2p_Subscribe : "Le filtrage messageries instantan�es et applications peer to peer est seulement disponible avec la brique de service UTM Orange fournie par Netasq.<br/><br/>" +
					    "Pour obtenir ces services avanc�s, veuillez cliquer sur le bouton \"souscrire\" ci-dessous.",

    ///////////////////////////////////////////////////////////////////;;
    // DNS;;
       m_dns_setServer : "Set DNS server",
       m_dns_autoDhcp : "automatically via DHCP", 
       m_dns_manual : "manually", 
       m_dns : "DNS", 
       m_dns_Primary : "primary", 
       m_dns_Secondary : "secondary", 
       m_dns_header : "This page enables you to configure DNS servers",

    ///////////////////////////////////////////////////////////////////;;
    // Port config;;
    m_portconf_port : "Ports", 
    m_portconf_LAN : "LAN",
    m_portconf_LAN2 : "LAN2",
    m_portconf_DMZ : "DMZ",
    m_portconf_WAN : "WAN",
	m_portconf_attach: "Affectation des ports",
	m_portconf_interface: "interface",
	m_portconf_lan_lan2_no_disabled: "Port E1 (LAN) and Port E3 (LAN2) cannot be simultaneously disabled",
		
    ///////////////////////////////////////////////////////////////////
    // LAN config
    m_lanitf_title : "LAN interface parameters",
	m_lanitf_ip : "LAN IP address",
    m_lanitf2_title : "LAN2 interface parameters",
	m_lanitf2_ip : "LAN2 IP address",
	m_dmzitf_title : "DMZ interface parameters",
	m_dmzitf_ip : "LAN DMZ IP address",
	m_lanitf_mask: "IP subnet mask",
	m_lanitf_pls_config: "Please configure",	
	m_lanitf_change: "Changing",	
	m_lanitf_confirm_overwrite: "and subnet mask will:",
	m_lanitf_confirm_overwrite_2: "Reset DHCP parameters",
	m_lanitf_confirm_overwrite_3: "Reset reserved IP address settings",
	m_lanitf_confirm_overwrite_4: "VPN configuration might become invalid, and might need to be reconfigured",
	m_lanitf_confirm_overwrite_5: "Are you sure you want to continue?",		
	m_landhcp_title: "DHCP parameters",
	m_landhcp_enable : "Enable DHCP server",
	m_landhcp_range_start : "DHCP range start",
	m_landhcp_range_end : "DHCP range end",
	m_landhcp_range_invalid: "DHCP range stop must be greater than DHCP range start!",
	m_landhcp_incompatible: "is incompatible with",	
	m_landhcp_dns_mode : "DNS mode",
	m_landhcp_dns_pri : "Primary DNS server",
	m_landhcp_dns_pri_lower: "primary DNS server",
	m_landhcp_dns_sec : "Secondary DNS server",	
	m_landhcp_dns_sec_lower: "secondary DNS server",
	m_landhcp_dns_address: "address",	
	m_landhcp_1_dns_server_required : "At least one DNS server is required",		
	m_landhcp_dns_static : "static",
	m_landhcp_dns_dynamic : "dynamic",
	m_landhcp_dns_none : "no DNS",
	m_lanip_reserved_ip : "Reserved IP addresses",
	m_lanip_reserved_ip_lower: "reserved IP address",	
	m_lanip_reserved_ip_limit : "Reserved IP address list is limited to",	
	m_lanip_reserved_ip_entry: "entries",
    m_lanip_reserved_diff_lan : "Reserved IP address must be different from",		
	m_lanitf_forbidden_ip: "Network & broadcast addresses are forbidden for",
    m_lanip_zero: "this reserved IP address is forbidden!",		
	m_landhcp_range_or_map_required : "When the DNS mode is static mode, it is required to configure either a DHCP range, or to have at least on reserved IP address.",
	m_lanitf_already_used: "This network address is already used by the Open appliance.  Please enter other parameters",
	m_lanitf_invalid_mac: "Invalid MAC address! Example of valid format: 'aa:bb:cc:dd:ee:ff'",
	
		
    ///////////////////////////////////////////////////////////////////
    // My Form
	m_formNoEmpty : "cannot be empty",
	m_formFixError: "Please fix the following errors:",
	m_formTooLong : "cannot have more than",
	m_formChar: "characters",
	m_formInvalid: "is invalid",
	m_formInvalidCapital: "Invalid",
	m_exclamationMark: "!",
    m_formAlphaNumericChar: "can only contain alpha numeric characters",
	
				
    ///////////////////////////////////////////////////////////////////;;
    // Buttons and Images;;
    m_imageDir : 'images/fr/',
	m_ok : 'ok',
	m_error : 'erreur',
	m_info : 'information',
	m_subscribe : 'Souscrire',
	m_tooltip_cancel : "supprimer les modifications", 
	m_tooltip_apply : "sauvegarder les modifications",
	m_tooltip_add : "ajouter une nouvelle ligne",
	m_tooltip_delete : "supprimer une ligne", 
	m_tooltip_back: "revenir � l'�cran pr�c�dent",
    m_remindSaveChange : 'You are about to leave this page without saving your modifications.  Are you sure you want to continue?',

    ///////////////////////////////////////////////////////////////////
    // Logs
    m_log_top : 'top',
	m_log_refresh: 'refresh',
	m_log_click_to_config: 'Click here to configure log:',

    /////////////////////////////////////////;
    // plesae do not edit beyound dummy;
    dummy : ''
};
