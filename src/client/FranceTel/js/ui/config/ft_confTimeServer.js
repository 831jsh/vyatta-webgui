/*
 Document   : ft_confTimeServer.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
FT_confTimeServer = Ext.extend(FT_confFormObj, {
    thisObjName: 'FT_confTimeServer',
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confTimeServer.superclass.constructor(name, callback, busLayer);
    },
    	
    f_init: function()
    {
        this.f_setConfig( {
			id : 'conf_time_srv',
			items: [ {
				v_type: 'label',
				id: 'conf_time_srv_ntp_label',
				text: 'NTP server address',
				v_new_row: 'true'
			}, {
				v_type: 'text',
				id: 'conf_time_srv_ntp',
				size: '30',
				v_end_row: 'true'
			}],				
			buttons: [ {
				id: 'conf_time_server_apply_button',
				text: 'Apply',
				onclick: this.f_handleClick
			}, {
				id: 'conf_time_server_cancel_button',
				text: 'Cancel',
				onclick: this.f_handleClick
			}]
		})  
    },
	
    f_loadVMData: function(element)
    {
    },
    
    f_stopLoadVMData: function()
    {
    },
    
    f_handleClick: function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_time_server_apply_button') { //apply clicked
                alert('Time server apply button clicked');
            } else if (id == 'conf_time_server_cancel_button') { //cancel clicked
                alert('Time server cancel button clicked');               
            }
        }
    }	
    
});