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
                if(evt.f_isError())
                {
                    if(evt.m_errCode == 3)
                        g_utils.f_popupMessage('timeout', 'timeout');
                    else
                        alert(evt.m_errMsg);

                    return;
                }

                var dep = evt.m_value;  // get vm deploy record object
                if(dep == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);

                for(var i=0; i<dep.length; i++)
                {
                    var vmRec = g_busObj.f_getVmRecByVmId(dep[i].m_id);
                    var button = thisObj.f_createRenderButton(dep[i].m_id,
                                  vmRec.m_displayName, dep[i].m_status);

                    var vmData = [dep[i].m_time, vmRec.m_displayName + " (" +
                                  dep[i].m_version + ")", dep[i].m_status, button];

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

    this.f_createRenderButton = function(vmId, vmName, status)
    {
        var cb = '';
        if(status == 'scheduled')
        {
            cb = 'f_vmDeployCancel("' + vmId + '")';
            return thisObj.f_renderButton('Cancel', true, cb,
                    'Cancel ' + vmName);
        }
        else if(status == 'failed')
        {
            cb = 'f_vmDeployRestore("' + vmId + '")';
            return thisObj.f_renderButton('restore', true, cb, 'Restore ' + vmName);
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

function f_handleCancel(vm)
{
    alert('fire up add panel');
}

function f_handleRestore(vm)
{
    alert('fire up user editor panel for ' + vm);
}



