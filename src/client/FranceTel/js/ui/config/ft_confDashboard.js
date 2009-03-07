/*
    Document   : ft_confDashboard.js
    Created on : Mar 02, 2009, 6:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

FT_confDashboard = Ext.extend(FT_confBaseObj,
{
    thisObjName: 'FT_confDashboard',

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    constructor: function(name, callback, busLayer)
    {
        FT_confDashboard.superclass.constructor(name, callback, busLayer);
    },

    f_getConfigurationPage: function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    },

    f_createColumns: function()
    {
        var cols = [];

        cols[0] = this.f_createColumn('Application', 180, 'text', '6');
        cols[1] = this.f_createColumn('Status', 80, 'image', '35');
        cols[2] = this.f_createColumn('CPU', 120, 'progress', '8');
        cols[3] = this.f_createColumn('RAM', 120, 'progress', '8');
        cols[4] = this.f_createColumn('Disk', 120, 'progress', '8');
        cols[5] = this.f_createColumn('Need Updated', 130, 'checkbox', '40');

        return cols;
    },

    f_loadVMData: function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                // handle error code
                if(evt.f_isError())
                {
                    thisObj.f_stopLoadVMData();
                    thisObj.m_t
                    alert(evt.m_errMsg);

                    return;
                }

                var vmData = [];
                var vm = evt.m_value.m_vmRecObj;
                if(vm == undefined) return;

                thisObj.f_removeDivChildren(thisObj.m_div);
                thisObj.f_removeDivChildren(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_header);
                thisObj.m_div.appendChild(thisObj.m_body);
                thisObj.m_div.appendChild(thisObj.m_buttons);

                for(var i=0; i<=vm.length; i++)
                {
                    var v = vm[i];

                    if(v == undefined) break;
                    var img = thisObj.f_renderStatus(v.m_status);
                    var cpu = thisObj.f_renderProgressBar(v.m_cpu);
                    var mem = thisObj.f_renderProgressBar(v.f_getMemPercentage());
                    var disk = thisObj.f_renderProgressBar(v.f_getDiskPercentage());
                    vmData[i] = [v.m_name, img, cpu, mem, disk, ''];

                    var bodyDiv = thisObj.f_createGridRow(hd, vmData[i]);
                    thisObj.m_body.appendChild(bodyDiv);
                }
            }
        }

        this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    },

    f_stopLoadVMData: function()
    {
        this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
    },

    f_init: function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['Update', "f_dbHandleUpdate('vm')"],
                    ['Cancel', "f_dbHandleCancel()"]];
        this.m_buttons = this.f_createButtons(btns);

        return [this.m_header, this.m_body, this.m_buttons];
    }
});

function f_dbHandleUpdate(vm)
{

}

function f_dbHandelCancel()
{

}