/*
 Document   : ft_confRestoreUpdate.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function FT_confRestoreUpdate (name, callback, busLayer) {
    var thisObjName = 'FT_confRestoreUpdate';
	var thisObj = this;
	this.m_deployVm = undefined;
	this.m_vm = undefined;
	this.form = undefined;
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestoreUpdate.superclass.constructor(name, callback, busLayer);
    }	

	this.constructor(name, callback, busLayer);
		
    this.f_init = function(vmUpdate)
    {
		thisObj.m_vm = g_busObj.f_getVmRecByVmId(vmUpdate);
		thisObj.m_deployVm = g_busObj.f_getVmDeployRecByVmId(vmUpdate);
		
        this.f_setConfig( {
			id : 'conf_restore_update',
			items: [ {
				v_type: 'label',
				id: 'conf_restore_update_vm_label',
				text: 'vm name',			
				font_weight : 'bold',	
				v_new_row : 'true'
			}, {
				v_type: 'empty',
				v_new_row: 'true',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_restore_update_cver_label',
				padding : '30px',				
				text: 'Current version',
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id : 'conf_restore_update_cver_value',				
				text: 'current version',
				font_weight: 'bold',
				v_end_row: 'true'
			}, {
				v_type: 'label',
				id: 'conf_restore_update_pver_label',
				padding : '30px',				
				text: 'Previous version',
				v_new_row: 'true'
			}, {
				v_type: 'label',
				id : 'conf_restore_update_pver_value',				
				text: 'avail version',
				font_weight: 'bold',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_restore_update_update_button',
				text: 'Update',
				onclick: this.f_handleClick
			}, {
				id: 'conf_restore_update_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    }
	
	this.f_setData = function(label, value)
	{
        var field = document.getElementById(label);
        field.innerHTML = value;		
	}
	
    this.f_loadVMData = function(element)
    {
		thisObj.form = document.getElementById('conf_restore_update_form');
        thisObj.f_setData('conf_restore_update_vm_label', thisObj.m_vm.m_displayName);
        thisObj.f_setData('conf_restore_update_cver_value', thisObj.m_deployVm.m_version);
		thisObj.f_setData('conf_restore_update_pver_value', thisObj.m_deployVm.m_prevVer);
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
	this.f_restoreVmCb = function(eventObj)
	{
        if (eventObj.f_isError()) {
            g_utils.f_popupMessage('Restore failed: eventObj.m_errMsg', 'error', 'Error!',true);
		} else {
            g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID);                             			
		}            
	}	
	
	this.f_restoreVm = function() 
	{
		g_busObj.f_upgradeVm(thisObj.m_vm.m_name, thisObj.m_deployVm.m_prevVer, 'now', thisObj.f_restoreVmCb);
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_restore_update_update_button') { //update clicked
                this.f_restoreVm();
            } else if (id == 'conf_restore_update_cancel_button') { //cancel clicked
                g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_UPDATE_ID);                             
            }
        }
    }	    
}

FT_extend(FT_confRestoreUpdate, FT_confFormObj);