/*
    Document   : utm_confFireLevel.js
    Created on : May 04, 2009, 11:21:31 AM
    Author     : Kevin.Choi
    Description:
*/

/**
 * Firewall Security Level configuration panel screen
 */
function UTM_confFireLevel(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'UTM_confFireLevel';
    this.m_btnApplyId = "id_fireLevelApply";
    this.m_btnCancelId = "id_fireLevelCancel";
    this.m_rdAuthAllId = "id_fireLevelAuthAll";
    this.m_rdStandId = "id_fireLevelStandard";
    this.m_rdAdvanId = "id_fireLevelAdvance";
    this.m_rdCustomId = "id_fireLevelCustomized";
    this.m_rdBlockId = "id_fireLevelBlockAll";
    this.m_selRadioId = this.m_rdAuthAllId;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confFireLevel.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_fireLevelColName, 710, 'radTxt',
                    '10', false, 'left');

        return cols;
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                var val = evt.m_value;
                var rId = null;
                switch(val)
                {
                    case 'auth all':
                        rId = thisObj.m_rdAuthAllId;
                    break;
                    case 'standard':
                        rId = thisObj.m_rdStandId;
                    break;
                    case 'advance':
                        rId = thisObj.m_rdAdvanId;
                    break;
                    case 'custom':
                        rId = thisObj.m_rdCustomId;
                    break;
                    default:
                    case 'block':
                        rId = thisObj.m_rdBlockId;
                    break;
                }

                var r = document.getElementById(rId);
                if(r != null)
                    r.checked = true;

                var mainPanel = document.getElementById("utm_confpanel_");
                if(mainPanel != null)
                    mainPanel.style.height = 380+'px';
            }
        };

        var e = new UTM_eventObj(0, 'auth all', '');
        window.setTimeout(function(){cb(e)}, 100);

        g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    };

    this.f_getGridRowData = function(radio, header, msg)
    {
        html = "<table cellspacing=0 cellpadding=0 border=0><tbody><tr>" +
               "<td rowspan=2 valign=top>" + radio +
               "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td><b>" + header +
               "</b></td><tr><td>" + msg + "</td></tr></tbody></table>";

        return html;
    };

    this.f_initGridData = function()
    {
        var custom = g_lang.m_fireLevelBdCustom + "&nbsp;&nbsp;&nbsp;<input type='" +
                      "image' src='" + g_lang.m_imageDir + "bt_config.png' " +
                      "onclick='f_fireLevelConfigHandler()' title='" +
                      g_lang.m_fireLevelCustConfTip + "'>";
        var radioIds = [this.m_rdAuthAllId, this.m_rdStandId,
                        this.m_rdAdvanId, this.m_rdCustomId, this.m_rdBlockId];
        var rdHeaders = [g_lang.m_fireLevelHdAuth, g_lang.m_fireLevelHdStand,
                        g_lang.m_fireLevelHdAdvan, g_lang.m_fireLevelHdCustom,
                        g_lang.m_fireLevelHdBlock];
        var hdBodies = [g_lang.m_fireLevelBdAuth, g_lang.m_fireLevelBdStand,
                        g_lang.m_fireLevelBdAdvan, custom,
                        g_lang.m_fireLevelBdBlock];
        var h = [43, 43, 43, 53, 43];

        for(var i=0; i<radioIds.length; i++)
        {
            var radio = this.f_getGridRowData(this.f_renderRadio('no',
                        radioIds[i], "f_fireLevelRadioHandler('"+radioIds[i]+"')",
                        "secLevel", ""), rdHeaders[i], hdBodies[i]);

            this.m_gridBody.appendChild(thisObj.f_createGridRow(this.m_colModel,
                    [radio], h[i]));
        }

        ////////////////////////////////////
        // by default the grid row height is 28px. and since we change the
        // height to 43, we want to re-adjust grid height by adding addition
        // 2 rows
        this.f_increateTableRowCounter(2);
    }

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel);
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
        this.f_initGridData();
        this.f_loadVMData();

        var btns = [['Apply', "f_fireLevelApplyHandler()", "", this.m_btnApplyId, false],
                    ['Cancel', "f_fireLevelCancelHandler()", "", this.m_btnCancelId, false]];
        this.m_buttons = this.f_createButtons(btns);
        this.f_adjustDivPosition(this.m_buttons);

        return [this.f_headerText(), this.m_gridHeader,
                this.m_gridBody, this.m_buttons];
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_fireLevelHeader+"<br><br><br>");
    };

    this.f_enabledActionButtons = function(rId)
    {
        var isDirty = rId == thisObj.m_selRadioId ? false : true;

        thisObj.f_enabledDisableButton(this.m_btnApplyId, isDirty);
        thisObj.f_enabledDisableButton(this.m_btnCancelId, isDirty);
    };

    this.f_resetInput = function()
    {
        var r = document.getElementById(thisObj.m_selRadioId);
        if(r != null)
        {
            r.checked = true;
            thisObj.f_enabledActionButtons(thisObj.m_selRadioId);
        }
    }
}
UTM_extend(UTM_confFireLevel, UTM_confBaseObj);


function f_fireLevelConfigHandler(e)
{
    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_FW_CUSTOM_ID);
}

function f_fireLevelApplyHandler(e)
{
    //g_configPanelObj.m_activeObj.f_groupsChkboxCb();
}

function f_fireLevelCancelHandler(e)
{
    g_configPanelObj.m_activeObj.f_resetInput();
}

function f_fireLevelRadioHandler(rId)
{
    g_configPanelObj.m_activeObj.f_enabledActionButtons(rId);
}
