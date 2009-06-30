/*
    Document   : ft_language_fr.js
    Created on : Mar 23, 2009, 2:18:11 PM
    Author     : Kevin.Choi
    Description:
*/

//Label;English;English corrected;French;Comments

var g_lang =
{
    ///////////////////////////////////////////////////////////////////
    // General
    m_tableTooltip1 : "Cliquer ici pour effectuer un tri.",
    m_networkConfig : "r�seau",
    m_mainLang : 'fr',    
	m_mainMap : 'plan',
	m_mainOA : 'Open Appliance',
	m_mainEnglish : 'English',
	m_mainFrench : "Fran�ais",
	m_mainLogin : "entrer",
	m_mainLogout : "d�connecter", 
	m_mainUserName : "utilisateur", 
	m_mainPassword : "mot de passe",
	m_mainWarning : "<p>si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.<br/>" +  
                    "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.</p>",
	m_mainBLBWarning : "<p>si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.<br/>" + 
                     "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.</p>",
	m_mainWelcome : "bienvenue",
	m_mainPleaseSignIn : "veuillez vous authentifier pour acc�der au web d'administration de l'Open Appliance",
	m_menuApp : "applications",
	m_menuUsers : "utilisateurs",
	m_menuMonitor : "supervision",
	m_menuBackup : "sauvegarde / restauration",
	m_menuConfig : "configuration",
	m_menuMyProfile : "mon profil",
	m_menuDashboard : "tableau de bord",
	m_menuUpdates : "mises � jour", 
	m_menuUpdatePlan : "historique et planification des mises � jour", 
	m_menuRestart : "red�marrage",
	m_menuRestartApp : "red�marrage d'application(s) ou de l'Open Appliance",
	m_menuSubscribe : "souscrire", 
	m_menuSubcription : "souscription",
	m_menuUserList: "liste des utilisateurs",
	m_menuUserRight : "droits des utilisateurs",
	m_menuHardware : "hardware", 
	m_menuHardwareMonitor : "supervision hardware",
	m_menuNetwork : "r�seau",
	m_menuNetworkMonitor : "supervision r�seau",
	m_menuConfigBackup : "sauvegarde",
	m_menuConfigRestore : "restauration", 
	m_menuEmailServer : "serveur mails",
	m_menuEmailServerConfig : "param�trage du serveur mails",
	m_menuTimeServer : "serveur NTP",
	m_menuTimerServerConfig : "param�trage du serveur NTP",
	m_menuUserDir : "serveur LDAP",
	m_menuLDAPConfig : "param�trage serveur LDAP",
	m_menuBLBAssocication : "association BLB", 
	m_menuPasswordPolicy : "politique mots de passe", 
	m_menuAddUser : "ajouter un utilisateur",
	m_menuUpdateUser : "modifier un utilisateur",
	m_menuUpdate : "mettre � jour",
	m_menuRestore : "restaurer", 
	m_menuRestoreDesc : "description du fichier de sauvegarde",
	m_menuBLBCredCheck : "v�rification des identifiants de la BLB",
	m_menuContact : "contact",
	m_menuSitemap : "plan du site",
	m_menuCopyRight : "copyright France Telecom",

	m_menu_des_App : "applications",
	m_menu_des_Users : "utilisateurs",
	m_menu_des_Monitor : "supervision",
	m_menu_des_Backup : "sauvegarde / restauration",
	m_menu_des_Config : "configuration",
	m_menu_des_MyProfile : "mon profil",
	m_menu_des_Dashboard : "tableau de bord",
	m_menu_des_Updates : "mises � jour",
	m_menu_des_UpdatePlan : "historique et planification des mises � jour",
	m_menu_des_Restart : "red�marrage",
	m_menu_des_RestartApp : "red�marrage d'application(s) ou de l'Open Appliance",
	m_menu_des_Subscribe : "souscrire",
	m_menu_des_Subcription : "souscription", 
	m_menu_des_UserList : "liste des utilisateurs",
	m_menu_des_UserRight : "droits des utilisateurs",
	m_menu_des_Hardware : "hardware",
	m_menu_des_HardwareMonitor : "supervision hardware",
	m_menu_des_Network : "r�seau", 
	m_menu_des_NetworkMonitor : "supervision r�seau",
	m_menu_des_ConfigBackup : "sauvegarde",
	m_menu_des_ConfigRestore : "restauration",
	m_menu_des_EmailServer : "serveur mails",
	m_menu_des_EmailServerConfig : "param�trage du serveur mails",
	m_menu_des_TimeServer : "serveur NTP",
	m_menu_des_TimerServerConfig : "param�trage du serveur NTP",
	m_menu_des_UserDir : "serveur LDAP", 
	m_menu_des_LDAPConfig : "param�trage serveur LDAP",
	m_menu_des_BLBAssocication : "association BLB",
	m_menu_des_PasswordPolicy : "politique mots de passe",
	m_menu_des_AddUser : "ajouter un utilisateur", 
	m_menu_des_UpdateUser : "modifier un utilisateur",
	m_menu_des_Update : "mettre � jour",
	m_menu_des_Restore : "restaurer",
	m_menu_des_RestoreDesc : "description du fichier de sauvegarde",
	m_menu_des_BLBCredCheck : "v�rification des identifiants de la BLB", 

    ///////////////////////////////////////////////////////////////////
    // pagination
    m_pgFirst : "first",
    m_pgPrev : "previous",
    m_pgLast : "last",
    m_pgNext : "next",

    ///////////////////////////////////////////////////////////////////;;;
    // Calendar;;;
	m_calToday : "aujourd'hui",
	m_calClear : "Clear",
	m_calArrMonthNames : ['Jan', 'F�v', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'D�c'],
    m_calArrWeekInits : ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    m_calInvalidDateMsg : "la date entr�e est invalide",
    m_calOutOfRangeMsg : "la date entr�e est invalide",
    m_calDoesNotExistMsg : "la date entr�e est invalide",
    m_calInvalidAlert : ["date invalide(", ") ignor�e."],
    m_calDateDisablingError : ["Erreur ", " n'est pas un objet date."],
    m_calRangeDisablingError : ["Erreur ", "doit contenir 2 �l�ments."],
    m_calDateDisplayFormat : 'dd-mm-yy',
    m_calDateOutputFormat : 'DD/MM/YYYY', 
    //Set it to;; 0 (Zero) for Sunday, 1 (One) for Monday etc..; 1 (Zero) for Dimanche, 1 (One) for Lundi etc..
    m_calWeekStart : 1,

    ///////////////////////////////////////////////////////////////////;;;
    // Dash board screen;;;

    // dashboard header;;;
    m_dbHdApplication : "application",
    m_dbHdStatus : "�tat", 
    m_dbHdCPU : "CPU", 
    m_dbMemory : "m�moire", 
    m_dbDiskSpace : "espace disque",
    m_dbUpdateNeeded : "mise � jour n�cessaire",
    m_dbTooltipUpdateNeed : "version � mettre � jour - ", 
    m_dbTooltipCancel : "annuler la s�lection", 
    m_dbTooltipUpdate : "mettre � jour les applications s�lectionn�es", 
    m_dbUsed : "utilis�", 
    m_dbTotal : "total", 
    m_dbFree : "libre",
    m_dbStatusUp : "�tat : actif", 
    m_dbStatusDown : "�tat : inactif", 
    m_dbStatusUnknown : "�tat inconnu", 
    m_dbErrorTitle : "tableau de bord non disponible", 
    m_dbCriticalUpdate : "Une mise � jour critique vient d'�tre install�e", 

    ///////////////////////////////////////////////////////////////////;;;
    // VM Update & History screen;;;
    m_uhHdDate : "Date", 
    m_uhHdWho : "sauvegarder par",
    m_uhErrorTitle : "erreur de mise � jour",  
    m_uhCancelTitle : "annuler la planification de mise(s) � jour",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Update Restore;;;
	m_resUpdateVmName : "nom de l'application",
	m_resUpdateCurVer : "version courante",
	m_resUpdatePrevVer : "version pr�c�dente", 
	m_resUpdateFail : "�chec de la restauration",
    m_resUploadCompleted : "le t�l�chargement de fichiers est effectu�",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Schedule Update;;;
	m_schedUpdateSched : "Veuillez planifier une mise � jour pour les applications suivantes",
	m_schedUpdateNow : "maintenant",
	m_schedUpdateLater : "plus tard", 
	m_schedUpdateNewVer : "nouvelle version",
	m_schedUpdateRangeChk : "vous planifiez � six mois",
	m_schedUpdateDate : "date de planification",
	m_schedUpdateHour : "heure de planification", 
	m_schedUpdateMinute : "minute de planification",
	m_schedUpdateErrorOccur : "les erreurs suivantes sont survenues alors qu'une planification de mise(s) � jour �tait en cours",

    ///////////////////////////////////////////////////////////////////;;;
    // VM Restart screen;;;
    m_restartOA : "Open Appliance",
    m_restartErrorTitle : "erreur de red�marrage",
    m_restartTitle : "red�marrer une application", 
    m_restartStopTitle : "stopper une application", 
    m_restartConfirm : "Etes-vous s�r de vouloir red�marrer",
    m_restartStopConfirm : "Etes-vous s�r de vouloir stopper",

    ///////////////////////////////////////////////////////////////////;;;
    // Subscribe screen;;;
    m_subscribePlease : "Veuillez cliquer sur les liens suivants pour ajouter ou supprimer une application",
	m_subscribeInstall: "installer une nouvelle application",
	m_subscribeRemove : "supprimer une nouvelle application",

    ///////////////////////////////////////////////////////////////////;;;
    // User List screen;;;
    m_ulErrorTitle : "erreur de chargement de la liste utilisateurs", 
    m_ulTooltipAddUser : "cr�er un nouveau compte utilisateur", 
    m_ulDeleteHeader : "supprimer un compte utilisateur", 
    m_ulClick2Edit : "cliquer ici pour �diter cet utilisateur",
    m_ulSendEmail : "envoyer un email � cet utilisateur", 
    m_ulDeleteUser : "supprimer un compte utilisateur", 

    ///////////////////////////////////////////////////////////////////;;;
    // User Right screen;;;
    m_urErrorTitle : "erreur sur la gestion des droits utilisateurs",
    m_urConfirmTitle : "modifier les droits utilisateurs", 
    m_urCommitChange : "Etes-vous s�r de vouloir changer ces droits ?", 
    m_urBtnApply : "modifier les droits", 
    m_urBtnCancel : "annuler les modifications",

    ///////////////////////////////////////////////////////////////////;;;
    // User Add screen;;;
    m_userUsername : "nom d'utilisateur",
	m_userSurname : "nom", 
	m_userGivenName : "pr�nom", 
	m_userEmail : "email",
    m_userUsernameInvalidCharacter : "nom d'utilisateur", 

    ///////////////////////////////////////////////////////////////////;;;
    // User Editor screen;;;
    m_userResetPasswdExit : "l'utilisateur existe d�j�", 
    m_userResetPasswdNotExit : "l'utilisateur n'existe pas", 
    m_userResetPasswd : "r�initialiser le mot de passe", 
    m_userResetPasswdConfirm : "Etes-vous s�r de vouloir r�initialiser le mot de passe de cet utilisateur ?", 
	m_userConfirmation : "confirmation", 
	m_userResetPasswdSuccess : "changement de mot de passe effectu�",
	m_userResetPasswdComplete : "changement de mot de passe", 

    ///////////////////////////////////////////////////////////////////;;;
    // Configuration Restore Description screen;;;
    m_confRestorDescp : "lorem ipsum onsectetuer....", 

    ///////////////////////////////////////////////////////////////////;;;
    // Hw monitor;;;
    m_component : "composant", 


    ///////////////////////////////////////////////////////////////////;;;
    // Common variables;;;
    m_cancelConfirm : "Etes-vous s�r de vouloir annuler", 
    m_deleteConfirm : "Etes-vous s�r de vouloir supprimer", 
    m_login : "login", 
    m_name : "nom", 
    m_delete : "supprimer", 
    m_email : "email",
    m_password : "mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Buttons & Images;;;
    m_imageDir : "images/fr/",
	m_ok : "ok",
	m_error : "erreur", 
	m_info : "information",

    ///////////////////////////////////////////////////////////////////;;;
    // Popup Message Dialog;;;
    m_puSessionTimeout : "session expir�e",
    m_puSessionTimeoutMsg : "Pour des raisons de s�curit�, votre session n'est plus active.<br>Veuillez vous r�-authentifier.",

    ///////////////////////////////////////////////////////////////////;;;
    // Login Dialog;;;
    m_loginPrompt : "Veuillez entrer vos identifiants.", 
    m_loginError : "erreur de login", 
    m_loginUnableToLogin : "impossible de se connecter",
	m_loginContactCS : "Si vous n'avez pas de login et mot de passe, veuillez contacter votre centre support clients.",
	m_loginEnableJS : "Attention : pour vous connecter, votre navigateur doit accepter les pop-ups et les cookies.",

    ///////////////////////////////////////////////////////////////////;;;
    // Mainframe;;;
	m_mainFrmGuest : "invit�",
    m_mainFrmWelcome : "bienvenue",
	m_mainFrmConnected : "Vous �tes connect� au module d'administration de l'Open Appliance",
	m_mainFrmSignIn : "Veuillez vous authentifier", 

    ///////////////////////////////////////////////////////////////////;;;
    // My Form;;;
	m_formNoEmpty : "ne peut �tre vide",
	m_formFixError : "veuillez corriger les erreurs suivantes", 
	m_formInvalid : "est invalide",
	m_formTooLong : "cannot have more than",
	m_formChar: "characters",	
	m_formSave : "sauvegard�",
	m_formPassword : "mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Password change dialog;;;
	m_passwordChangePlease : "Veuillez changer votre mot de passe pour continuer",
	m_passwordChangeSuccess : "Votre nouveau mot de passe a �t� enregistr�.", 
	m_passwordChangeRelogin : "Veuillez cliquer sur le bouton entrer pour vous loguer avec votre nouveau mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // My Profile;;;
	m_myprofLogin : "utilisateur",
	m_myprofOldPasswd : "ancien mot de passe", 
	m_myprofNewPasswd : "nouveau mot de passe",
	m_myprofConfirmPasswd : "confirmation mot de passe", 
	m_myprofNPWnotCPW : " Les mots de passe rentr�s dans les champs 'nouveau' et 'confirmation' ne sont pas identiques", 
	m_myprofPasswdRestSucessful : "changement de mot de passe effectu�", 
	m_myprofResetPasswdDone : "changement de mot de passe",

    ///////////////////////////////////////////////////////////////////;;;
    // Backup configuration;;;
	m_backupConfig : "config.", 
	m_backupData : "donn�es", 
	m_backupApp : "application",
	m_backupSelectOne : "Veuillez s�lectionner au moins une application � sauvegarder",
	m_backupFail : "�chec de sauvegarde", 
	m_backupInProgress : "Sauvegarde en cours.",
	m_backup2pcInProgress : "sauvegarde en cours. Veuillez patienter un moment. Une fen�tre vous avertira lorsque la sauvegarde sera effectu�e",
	m_backupPlsDelete : "Le nombre maximum de sauvegardes stock�es sur l'Open Appliance est atteint. Veuillez supprimer la plus vieille et r�essayez",
	m_backupMyPC : "mon PC", 
    m_backupTooltipCancel : "annuler les modifications", 
    m_backupTooltipBackup : "sauvegarder les applications s�lectionn�es",

    ///===================================================================================================================
	m_backupPlsWait: "Une autre demande de sauvegarde est actuellement en cours de traitement. S'il vous pla�t attendez quelques minutes et essayez � nouveau",


    ///////////////////////////////////////////////////////////////////;;;
    // Restore configuration;;;
    m_restoreErrorTitle : "erreur de restauration", 
    m_restoreUploadTitle : "t�l�charger un fichier de restauration",
    m_resoteUploadErrFileType : "type de fichier non compatible.",
    m_restoreHdContent : "contenu",
    m_restoreHdRestore : "restaurer", 
    m_restoreHdDownload : "t�l�charger",
    m_restoreClickRestore : "cliquer ici pour restaurer", 
    m_restoreArchive : "restaurer la sauvegarde", 
    m_restoreDelTitle : "supprimer la sauvegarde", 
    m_restoreDel : "supprimer la sauvegarde", 
    m_restoreDlConfirm : "Etes-vous s�r de vouloir t�l�charger le fichier suivant", 
    m_restoreDownload : "t�l�charger la sauvegarde", 
    m_restoreRestorePC : "restaurer un fichier de mon PC", 
    m_restoreFromMyPCTip : "Cliquer ici pour d�marrer la restauration d'un fichier de mon PC",

    ///////////////////////////////////////////////////////////////////;;;
    // Restore Desc. configuration;;;
    m_resDescErrorTitle : "description de la configuration � restaurer", 
    m_resDescConfirm : "Etes-vous sur de vouloir restaurer les �l�ments s�lectionn�s ?", 
    m_resDescHdConf : "config.", 
    m_resDescHdData : "donn�es", 

    ///////////////////////////////////////////////////////////////////;;;
    // BLB configuration;;;
	m_blbStandAloneOA : "Open Appliance seule", 
	m_blbAssociation : "BLB associ�e", 
	m_blbComplete : "L'association � la BLB a r�ussi", 

    ///////////////////////////////////////////////////////////////////;;;
    // Email Server configuration;;;
	m_emailSmtpAddr : "adresse serveur SMTP", 
	m_emailLocalMachName : "nom d'exp�diteur", 
	m_emailLocalEmail : "adresse email exp�diteur", 
	m_emailAuthName : "nom utilisateur",
	m_emailAuthPasswd : "mot de passe utilisateur",
	m_emailSrvConfig : "param�trage du serveur serveur mail",

    ///////////////////////////////////////////////////////////////////;;;
    // LDAP Server configuration;;;
	m_ldapSrvLoc : "localisation du serveur LDAP",
	m_ldapInOA : "dans l'Open Appliance", 
	m_ldapInLan : "sur le LAN Entreprise", 
	m_ldapSrvAddr : "adresse du serveur", 
	m_ldapSuffix : "Suffixe", 
	m_ldapUsrUpdateRt : "utilisateur (droits d'�criture)", 
	m_ldapUsrReadRt : "utilisateur (droits de lecture)",
	m_ldapPasswdUpdateRt : "mot de passe (droits d'�criture)", 
	m_ldapPasswdReadRt : "mot de passe (droits de lecture)", 

    ///////////////////////////////////////////////////////////////////;;;
    // Password Policy configuration;;;
	m_passwdPolicyChangeAtLogin : "l'utilisateur doit changer son mot de passe � la premi�re connexion", 
	m_passwdPolicyCanKeep : "l'utilisateur peut conserver son mot de passe par d�faut", 

    ///////////////////////////////////////////////////////////////////;;;
    // NTP server configuration;;;
	m_ntpSrvAddr : "adresse serveur NTP", 
	m_ntpTimeSrvAddr : "adresse serveur de temps", 
	m_ntpTimeSrvConfig : "configuration serveur de temps", 

    ///////////////////////////////////////////////////////////////////;;;
    // Tooltip;;;
	m_tooltip_cancel : "supprimer les modifications", 
	m_tooltip_apply : "sauvegarder les modifications",
	m_tooltip_add : "ajouter une nouvelle ligne", 
	m_tooltip_delete : "supprimer une ligne", 
	m_tooltip_back : "revenir � l'�cran pr�c�dent", 
	m_tooltip_restore : "restaurer", 
	m_tooltip_update : "mettre � jour", 

    ///////////////////////////////////////////////////////////////////;;;
    // Contact page;;;
	m_contact : "contact",
	m_contact_message : "Pour toute question, veuillez contacter votre service clients en appelant le 3901",

    /////////////////////////////////////////;;;
    // plesae do not edit beyound dummy;;;
    dummy : ''
}
