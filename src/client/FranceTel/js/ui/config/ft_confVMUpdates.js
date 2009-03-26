/*
    Document   : ft_confVMUpdates.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confVMUpdates(name, callback, busLayer)
{
    this.thisObjName = 'FT_confVMUpdates';
    var thisObj = this;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confVMUpdates.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    /**
     * define your column header here....
     */
    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Date', 200, 'text', '6');
        cols[1] = this.f_createColumn('Application', 200, 'text', '6');
        cols[2] = this.f_createColumn('Status', 120, 'text', '6');
        cols[3] = this.f_createColumn(' ', 120, 'button', '25');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, 'VM Update Error'))
                    return;

                var dep = evt.m_value;  // get vm deploy record object
                if(dep == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                for(var i=0; i<dep.length; i++)
                {
                    var vmRec = g_busObj.f_getVmRecByVmId(dep[i].m_id);
                    var button = thisObj.f_createRenderButton(dep[i].m_id,
                                  vmRec.m_displayName, dep[i].m_status,
                                  vmRec.m_prevVersion);

                    var vmData = [dep[i].m_time, vmRec.m_displayName + " (" +
                                  dep[i].m_version + ")",
                                  thisObj.f_createRenderStatus(dep[i].m_status,
                                  dep[i].m_msg), button];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_getVMUpdateListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    },

    this.f_createRenderStatus = function(status, msg)
    {
        if(msg == undefined || msg.length == 0)
            return "<p>"+status+"</p>";
        else
            return '<p title="' + msg + '">' + status + '</p>';
    }

    this.f_createRenderButton = function(vmId, vmName, status, prevVer)
    {
        var cb = '';
        if(status == 'scheduled')
        {
            cb = "f_vmDeployCancel('" + vmId + "', '" + vmName + "')";
            return thisObj.f_renderButton('Cancel', true, cb,
                    'Cancel ' + vmName);
        }
        else if(status == 'failed' || status == 'succeeded')
        {
            cb = "f_vmDeployRestore('" + vmId + "', '" + vmName + "')";
            return thisObj.f_renderButton('Restore', prevVer == undefined ?
                false:true, cb, 'Restore ' + vmName);
        }

        return "";
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        return [this.m_header, this.m_body];
    }
}
FT_extend(FT_confVMUpdates, FT_confBaseObj);

function f_vmHandleDeployCancel(e, vmId)
{
    var cb = function(evt)
    {
        if(!g_configPanelObj.m_activeObj.f_isServerError(evt, 'VM Update Planning Error'))
            g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_cancelVMDeploy(vmId, cb);
}

function f_vmDeployCancel(vmId, vmName)
{
    g_utils.f_popupMessage('Are you sure you want to cancel (' + vmName + ') VM?',
                'confirm', 'Cancel Update Schedule',true,
                "f_vmHandleDeployCancel(this, '"+ vmId + "')");
}

function f_vmDeployRestore(vmId, vmName)
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_UPDATE_ID, vmId);
}



