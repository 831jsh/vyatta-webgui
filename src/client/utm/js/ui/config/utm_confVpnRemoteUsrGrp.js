/*
 Document   : utm_confVpnRemoteUsrGrp.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confVpnRemoteUsrGrp(name, callback, busLayer)
{
    var thisObjName = 'UTM_confVpnRemoteUsrGrp';
    var thisObj = this;
    this.m_form = undefined;
	this.m_usrGrp = undefined;
	this.m_change = false;
	this.m_eventCbFunction = 'f_confFormObjEventCallback';
	
	this.m_ezItems = [
	    'conf_vpn_rug_preshared_key_label',
		'conf_vpn_rug_confirm_preshared_key_label'
	];
							  
	this.m_expItems = [
	    'conf_vpn_rug_divider4',
	    'conf_vpn_rug_basic_spacer7',
		'conf_vpn_rug_ike_phase1_label',
		'conf_vpn_rug_ike_p1_proto_label',
		'conf_vpn_rug_ike_p1_ex_mode_label',		
	    'conf_vpn_rug_ike_p1_encrypt_label',
		'conf_vpn_rug_ike_p1_preshare_label',
		'conf_vpn_rug_ike_p1_confirm_preshare_label',
		'conf_vpn_rug_ike_p1_auth_label',
		'conf_vpn_rug_ike_p1_diffle_label',
		'conf_vpn_rug_ike_p1_lifetime_label',		
		'conf_vpn_rug_spacer8',
		'conf_vpn_rug_divider5',
		'conf_vpn_rug_spacer9',			
		'conf_vpn_rug_ike_p2_label',
		'conf_vpn_rug_ike_p2_local_network_label',
		'conf_vpn_rug_ike_p2_remote_network_label',
		'conf_vpn_rug_ike_p2_dfs_label',
		'conf_vpn_rug_ike_p2_lifetime_label',
		'conf_vpn_rug_ike_p2_encrypt_label',
		'conf_vpn_rug_ike_p2_auth_label'
	];
		    
	this.m_clickItems = [
	    'conf_vpn_rug_tunnel_config_mode_ez',
		'conf_vpn_rug_tunnel_config_mode_exp'
	];
	
	this.m_keyItems = [
	    'conf_vpn_rug_prof_name',
		'conf_vpn_rug_usr',
        'conf_vpn_rug_preshared_key',
        'conf_vpn_rug_confirm_preshared_key',
        'conf_vpn_rug_ike_p1_preshare',
        'conf_vpn_rug_ike_p1_confirm_preshare',
        'conf_vpn_rug_ike_p1_lifetime',
        'conf_vpn_rug_ike_p2_local_network_ip',
        'conf_vpn_rug_ike_p2_local_network_mask',
        'conf_vpn_rug_ike_p2_remote_network_ip',
        'conf_vpn_rug_ike_p2_remote_network_mask',
        'conf_vpn_rug_ike_p2_lifetime'		
	];		
	
	this.m_changeItems = [
        'conf_vpn_rug_vpn_software',
        'conf_vpn_rug_auth',
        'conf_vpn_rug_ip_alloc', 
        'conf_vpn_rug_ip_access',
        'conf_vpn_rug_ike_p1_proto',   
        'conf_vpn_rug_ike_p1_ex_mode',
        'conf_vpn_rug_ike_p1_encrypt',
        'conf_vpn_rug_ike_p1_auth',  
        'conf_vpn_rug_ike_p1_diffle',
        'conf_vpn_rug_ike_p2_dfs',  
        'conf_vpn_rug_ike_p2_encrypt',   
        'conf_vpn_rug_ike_p2_auth' 	
	];
			
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.privateConstructor(name, callback, busLayer);
    }

    this.privateConstructor = function(name, callback, busLayer)
    {
        UTM_confVpnRemoteUsrGrp.superclass.constructor(name, callback, busLayer);
    }			
    this.privateConstructor(name, callback, busLayer);	
    
    	
    this.f_init = function(obj)
    {
		if (obj != undefined) {
			thisObj.m_usrGrp = obj;
		}
		var defObj = new UTM_confFormDefObj('conf_vpn_rug', '500', new Array(), 
		    [{
                id: 'conf_vpn_rug_back_button',
                text: 'back',
				tooltip: g_lang.m_tooltip_back,
				align: 'left',
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rug_cancel_button',
				align: 'right',
                text: 'Cancel',
				tooltip: g_lang.m_tooltip_cancel,
                onclick: this.f_handleClick
            }, {
                id: 'conf_vpn_rug_apply_button',
				align: 'right',
                text: 'Apply',
				tooltip: g_lang.m_tooltip_apply,
                onclick: this.f_handleClick
            }]		
		);
		defObj.f_addLabelBold('conf_vpn_rug_header_label', g_lang.m_vpnRUG_GroupSettings,'true');
        defObj.f_addDivider('conf_vpn_rug_divider1','2');
		defObj.f_addEmptySpace('conf_vpn_rug_spacer1','2');
		defObj.f_addLabelBold('conf_vpn_rug_basic_label',g_lang.m_vpn_BasicSettings,'true');
		defObj.f_addInput('conf_vpn_rug_prof_name', '32', g_lang.m_vpnRUG_ProfileName);
		defObj.f_addHtml(
		   'conf_vpn_rug_vpn_software',
		   '<select name="conf_vpn_rug_vpn_software" id="conf_vpn_rug_vpn_software" class="v_form_input"><option value="safenet" selected>safenet</option>' +
		   '<option value="cisco">cisco</option>' + 
		   '<option value="microsoft">microsoft</option></select>',
		   g_lang.m_vpnRUG_VPNsoft
		);
		defObj.f_addInput('conf_vpn_rug_usr', '32', g_lang.m_vpn_Users);		
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer2','2');
        defObj.f_addDivider('conf_vpn_rug_divider2','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_spacer3','2');
					
		defObj.f_addLabelBold('conf_vpn_rug_usr_setting_label',g_lang.m_vpnRUG_UsrSettings,'true');
		defObj.f_addHtml(
		   'conf_vpn_rug_auth',
		   '<select name="conf_vpn_rug_auth" id="conf_vpn_rug_auth" class="v_form_input"><option value="Xauth" selected>Xauth</option>',
		   g_lang.m_vpn_auth
		);		
		defObj.f_addHtml(
		   'conf_vpn_rug_ip_alloc',
		   '<select name="conf_vpn_rug_ip_alloc" id="conf_vpn_rug_ip_alloc" class="v_form_input"><option value="internet DHCP" selected>internet DHCP</option>',
		   g_lang.m_vpnRUG_IPAlloc
		);			
		defObj.f_addHtml(
		   'conf_vpn_rug_ip_access',
		   '<select name="conf_vpn_rug_ip_access" id="conf_vpn_rug_ip_access" class="v_form_input"><option value="directly" selected>directly</option>',
		   g_lang.m_vpnRUG_InternetAccess
		);			
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer4','2');
        defObj.f_addDivider('conf_vpn_rug_divider3','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_spacer5','2');		
		
		defObj.f_addLabelBold('conf_vpn_rug_tunnel_setting_label',g_lang.m_vpn_TunnelSettings,'true');		
		defObj.f_addHtml(
		   'conf_vpn_rug_tunnel_config_mode',
           '<input id="conf_vpn_rug_tunnel_config_mode_ez" type="radio" name="conf_vpn_rug_tunnel_mode_group" value="ez" checked>&nbsp;' + 
				      g_lang.m_vpn_EZ + '&nbsp;&nbsp;' +
					  '<input id="conf_vpn_rug_tunnel_config_mode_exp" type="radio" name="conf_vpn_rug_tunnel_mode_group" value="exp">&nbsp;' +
					  g_lang.m_vpn_Expert,	
		   g_lang.m_vpn_TunnelConfigMode	   
		);
		defObj.f_addEmptySpace('conf_vpn_rug_spacer6','2');
		
        ////----------------------Easy mode----------------------							
		defObj.f_addPassword('conf_vpn_rug_preshared_key','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_rug_confirm_preshared_key','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);

		////----------------------Expert mode------------------ 
        defObj.f_addDivider('conf_vpn_rug_divider4','2');	
		defObj.f_addEmptySpace('conf_vpn_rug_basic_spacer7','2');
		defObj.f_addLabelBold('conf_vpn_rug_ike_phase1_label',g_lang.m_vpn_IKEnegPhase1,'true');
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_proto',
            '<select name="conf_vpn_rug_ike_p1_proto" id="conf_vpn_rug_ike_p1_proto" class="v_form_input"><option value="ESP/tunnel" selected>EXP/tunnel</option></select>',
			g_lang.m_vpn_IKE_p1_proto			
		);		
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_ex_mode',
            '<select name="conf_vpn_rug_ike_p1_ex_mode" id="conf_vpn_rug_ike_p1_ex_mode" class="v_form_input"><option value="aggressive" selected>aggressive</option></select>',
			g_lang.m_vpn_IKE_p1_ex_mode		
		);			
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_encrypt',
            '<select name="conf_vpn_rug_ike_p1_encrypt" id="conf_vpn_rug_ike_p1_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt		
		);	
		defObj.f_addPassword('conf_vpn_rug_ike_p1_preshare','25',g_lang.m_vpn_PresharedKey);
		defObj.f_addPassword('conf_vpn_rug_ike_p1_confirm_preshare','25',g_lang.m_vpn_Confirm + ' ' + g_lang.m_vpn_PresharedKey);
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_auth',
            '<select name="conf_vpn_rug_ike_p1_auth" id="conf_vpn_rug_ike_p1_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth		
		);			
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p1_diffle',
            '<select name="conf_vpn_rug_ike_p1_diffle" id="conf_vpn_rug_ike_p1_diffle" class="v_form_input"><option value="group 5" selected>group 5</option></select>',
			g_lang.m_vpn_Diffle		
		);			
		defObj.f_addPassword('conf_vpn_rug_ike_p1_lifetime','25',g_lang.m_vpn_LifeTime);
		
		defObj.f_addEmptySpace('conf_vpn_rug_spacer8','2');
        defObj.f_addDivider('conf_vpn_rug_divider5','2');
		defObj.f_addEmptySpace('conf_vpn_rug_spacer9','2');
		
		defObj.f_addLabelBold('conf_vpn_rug_ike_p2_label',g_lang.m_vpn_IKEphase2,'true');
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_local_network',
            '<input type="text" id="conf_vpn_rug_ike_p2_local_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_rug_ike_p2_local_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_LocalNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_remote_network',
            '<input type="text" id="conf_vpn_rug_ike_p2_remote_network_ip" size="16" class="v_form_input">&nbsp;/&nbsp;' +
				      '<input type="text" id="conf_vpn_rug_ike_p2_remote_network_mask" size="2" class="v_form_input">',
			g_lang.m_vpn_RemoteNetwork	
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_dfs',
            '<select name="conf_vpn_rug_ike_p2_dfs" id="conf_vpn_rug_ike_p2_dfs" class="v_form_input"><option value="group 5" selected>group 5</option></select>',
			g_lang.m_vpn_DFS	
		);							
		defObj.f_addPassword('conf_vpn_rug_ike_p2_lifetime','25',g_lang.m_vpn_LifeTime);
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_encrypt',
            '<select name="conf_vpn_rug_ike_p2_encrypt" id="conf_vpn_rug_ike_p2_encrypt" class="v_form_input"><option value="AES128" selected>AES128</option></select>',
			g_lang.m_vpn_Encrypt
		);						
		defObj.f_addHtml(
		    'conf_vpn_rug_ike_p2_auth',
            '<select name="conf_vpn_rug_ike_p2_auth" id="conf_vpn_rug_ike_p2_auth" class="v_form_input"><option value="SHA1" selected>SHA1</option></select>',
			g_lang.m_vpn_auth
		);						

        this.f_setConfig(defObj);
    }
    
    this.f_getConfigurationPage = function()
	{
		var children = new Array();
		children.push(this.f_createHeader());
		children.push(this.f_getForm());
		
	    return this.f_getPage(children);
	}	
	
	this.f_createHeader = function()
	{
        var txt = 'This page enables you to configure some connection groups for remote users.  Several users belong to the same group<br><br>';

        return this.f_createGeneralDiv(txt);
    }		

    this.f_loadVMData = function(element)
    {
        thisObj.m_form = document.getElementById('conf_vpn_rug' + "_form");
		thisObj.f_setFocus();
		thisObj.f_showExpert(false);
		thisObj.f_attachListener();	
		thisObj.f_enableAllButton(false);		
    }
	
	this.f_showExpert = function(b)
	{
        if (b) {
            for (var i=0; i < thisObj.m_expItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_expItems[i], false);
			}
            for (var i=0; i < thisObj.m_ezItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_ezItems[i], true);
			}			
		} else {
            for (var i=0; i < thisObj.m_expItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_expItems[i], true);
			}
            for (var i=0; i < thisObj.m_ezItems.length; i++) {
				thisObj.f_hideTableRow(thisObj.m_ezItems[i], false);
			}		
		}
		thisObj.f_resize();
	}
			
	this.f_setFocus = function()
	{
		thisObj.m_form.conf_vpn_rug_prof_name.focus();
	}		
    
    this.f_stopLoadVMData = function()
    {
		thisObj.f_detachListener();
    }
        		
    this.f_validate = function()
    {
        var error = g_lang.m_formFixError + '<br>';
        var errorInner = '';
        if (errorInner.trim().length > 0) {
            error = error + '<ul style="padding-left:30px;">';
            error = error + errorInner + '</ul>';
            g_utils.f_popupMessage(error, 'error', g_lang.m_error, true);
			return false;
        }
        return true;
    }
    
    this.f_apply = function()
    {
    }
    
    this.f_reset = function()
    {
    
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_vpn_rug_apply_button') { //apply clicked
                if (!thisObj.f_validate()) {
					return false;
				} 
			    thisObj.f_apply();
            } else if (id == 'conf_vpn_rug_cancel_button') { //cancel clicked
                thisObj.f_reset();
            } else if (id == 'conf_vpn_rug_tunnel_config_mode_ez') {
				thisObj.f_showExpert(false);
				thisObj.f_enableAllButton(true);
			} else if (id == 'conf_vpn_rug_tunnel_config_mode_exp') {
				thisObj.f_showExpert(true);
				thisObj.f_enableAllButton(true);
			} else if (id == 'conf_vpn_rug_back_button') {
				thisObj.f_back();
			}
        }
    }
	
	this.f_eventCallback = function(id)
	{
		g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID, null, true);				
	}
    
	this.f_changed = function()
	{
		return thisObj.m_change;		
	}
	
	this.f_back = function()
	{
		if (thisObj.f_changed()) {
			g_utils.f_popupMessage(g_lang.m_remindSaveChange, 'confirm', g_lang.m_info, true, 
			    thisObj.m_eventCbFunction + "('apply')"); 
		} else {
			g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_VPN_OVERVIEW_ID, null, true);			
		}
	}

    this.f_handleKey = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            thisObj.f_enableAllButton(true);
        }
    }	
   
    this.f_handleChange = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            thisObj.f_enableAllButton(true);
        }
    }   
   
    this.f_enableAllButton = function(state)
    {
        thisObj.f_enableButton('apply', state);
        thisObj.f_enableButton('cancel', state);
    }
    
    this.f_enableButton = function(btName, state)
    {
        var id = '';
        switch (btName.toLowerCase()) {
            case 'apply':
                id = 'conf_vpn_rug_apply_button';
                break;
            case 'cancel':
                id = 'conf_vpn_rug_cancel_button';
                break;
            default:
                break;
        }
        thisObj.f_enabledDisableButton(id, state);
		if (state) {
			thisObj.m_change = true;
		} else {
			thisObj.m_change = false;
		}
    }   

    this.f_attachListener = function()
    {        
        for (var i = 0; i < thisObj.m_clickItems.length; i++) {
            var el = document.getElementById(thisObj.m_clickItems[i]);
            g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < thisObj.m_keyItems.length; i++) {
            var el = document.getElementById(thisObj.m_keyItems[i]);
            g_xbObj.f_xbAttachEventListener(el, 'keydown', thisObj.f_handleKey, false);
        }
		for (var i = 0; i < thisObj.m_changeItems.length; i++) {
			var el = document.getElementById(thisObj.m_changeItems[i]);
			g_xbObj.f_xbAttachEventListener(el, 'change', thisObj.f_handleChange, false);
		}		
    }
    
    this.f_detachListener = function()
    {		
        for (var i = 0; i < thisObj.m_clickItems.length; i++) {
            var el = document.getElementById(thisObj.m_clickItems[i]);
            g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        }
        for (var i = 0; i < thisObj.m_keyItems.length; i++) {
            var el = document.getElementById(thisObj.m_keyItems[i]);
            g_xbObj.f_xbDetachEventListener(el, 'keydown', thisObj.f_handleKey, false);
        }
		for (var i = 0; i < thisObj.m_changeItems.length; i++) {
			var el = document.getElementById(thisObj.m_changeItems[i]);
			g_xbObj.f_xbDetachEventListener(el, 'change', thisObj.f_handleChange, false);
		}		
    }	
	
}

UTM_extend(UTM_confVpnRemoteUsrGrp, UTM_confFormObj);

