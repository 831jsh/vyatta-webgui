/*
    Document   : ft_confRestart.js
    Created on : Mar 03, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestart(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestart';
    var thisObj = this;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestart.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());

        return page;
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Application', 250, 'text', '6');
        cols[1] = this.f_createColumn('Status', 80, 'image', '35');
        cols[2] = this.f_createColumn('', 100, 'button', '25');
        cols[3] = this.f_createColumn('', 100, 'button', '25');
        cols[4] = this.f_createColumn('', 100, 'button', '25');

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
                if(thisObj.f_isServerError(evt, 'VM Restart Error'))
                {
                    thisObj.f_stopLoadVMData();
                    return;
                }

                var vm = evt.m_value;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_button);

                for(var i=0; i<vm.length; i++)
                {
                    var v = vm[i];

                    //////////////////////////////////
                    // skip open appliance
                    if(v.m_name == 'openapp' || v.m_name == 'blb') continue;

                    var enabled = v.m_status == 'up' ? true : false;

                    var img = thisObj.f_renderStatus(v.m_status);
                    var restart = thisObj.f_renderButton(
                                'Restart', enabled, "f_vmRestart('" +
                                v.m_name + "', '" + v.m_displayName + "')",
                                'Restart ' + v.m_name);
                    var stop = thisObj.f_renderButton(
                                'Stop', enabled, "f_vmStop('" +
                                v.m_name + "', '" + v.m_displayName + "')",
                                'Stop ' + v.m_name);
                    var start = thisObj.f_renderButton(
                                'Start', !enabled, "f_vmHandleStart('" +
                                v.m_name + "')", 'Start ' + v.m_name);
                    var vmData = [v.m_displayName, img, restart, stop, start];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData);
                    thisObj.m_body.appendChild(bodyDiv);
                }

                thisObj.f_adjustDivPosition(thisObj.m_button);
            }
        }

        g_utils.f_cursorWait();
        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }

    this.f_stopLoadVMData = function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.m_button = this.f_createOARestart();
        this.f_loadVMData();

        return [this.m_header, this.m_body, this.m_button];
    }

    this.f_createOARestart = function()
    {
        var handleFunc = "f_vmRestart('openapp')";
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';

        innerHtml += '<td width="120"><div style="height:30px; padding-left:10px; ' +
                      'padding-top:30px;"><b>Open Appliance:</b></div></td>';

        innerHtml += '<td width="110">' +
                    '<div title="Restart Open Appliance" style="height:30px; ' +
                    'padding-top:15px;" >' +
                    '<input type="image" src="images/bt_restart.gif" name="OpenAppl" ' +
                    'value="Restart" onclick="' + handleFunc +
                    '></div></td>';

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }
}
FT_extend(FT_confRestart, FT_confBaseObj);

function f_vmStop(vmId, vmName)
{
    g_utils.f_popupMessage('Are you sure you want to stop (' + vmName + ') VM?',
                'confirm', 'Stop VM Process', true,
                "f_vmHandleStop(this, '"+ vmId + "')");
}
function f_vmHandleStop(e, vmId)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        var cb = function()
        {
            g_configPanelObj.m_activeObj.f_loadVMData();
        }

        g_busObj.f_stopVM(vmId, cb);
    }
}

function f_vmRestart(vmId, vmName)
{
    if(vmId == 'openapp') vmName = 'Open Appliance';

    g_utils.f_popupMessage('Are you sure you want to restart (' + vmName + ') VM?',
                'confirm', 'Restart VM Process', true,
                "f_vmHandleRestart(this, '"+ vmId + "')");
}
function f_vmHandleRestart(e, vmId)
{
    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        var cb = function()
        {
            g_configPanelObj.m_activeObj.f_loadVMData();
        }

        g_busObj.f_restartVM(vmId, cb);
    }
}

function f_vmHandleStart(vm)
{
    var cb = function()
    {
        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    g_busObj.f_startVM(vm, cb);
}