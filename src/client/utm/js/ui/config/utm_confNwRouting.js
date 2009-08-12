/*
    Document   : UTM_confNwRouting.js
    Created on : June 05, 2009, 9:21:31 AM
    Author     : Kevin.Choi
    Description: network configuration for Routing screen
*/

/**
 * Network configuration Routing panel screen
 */
function UTM_confNwRouting(name, callback, busLayer)
{
    var thisObj = this;
    this.m_fwObj = busLayer.f_getFWObject();
    this.m_sendList = [];
    this.m_btnAddId = "nwRoutingddId";
    this.m_btnSaveId = "nwRoutingSaveId";
    this.m_btnCancelId = "nwRoutingCancelId";
    this.m_btnBackId = "nwRoutingBackId";
    this.m_enabledChkId = "nwRoutingEnableId-";
    this.m_gwId = "nwRouting_gw_Id-";
    this.m_intId = "nwRouting_int_Id-";
    this.m_gwIntDivId = "nw_gwInt_id-";
    this.m_rRecs = [];
    this.tempRuleNo = 0;
    this.m_fieldIds = ["rulenoId-", "dipaddr-", "dipaddrMaskId-", "optionId-",
                        "gwId-", "interfaceId-", "metricId-", "enabledId-"];
    this.m_protocol = ["Any", "tcp", "udp", "icmp", "ipsec", "vrrp", " "];

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        UTM_confNwRouting.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getPanelDiv(this.f_init());
    }

    this.f_createColumns = function()
    {
        var cols = [];
        this.f_colorGridBackgroundRow(true);
        var chkbox = 'enabled<br><br>' + thisObj.f_renderCheckbox("no",
                      thisObj.m_enabledChkId, "f_nwRouteEnabledOnChkClick('" +
                      thisObj.m_enabledChkId+"')", 'Click here to enable/disable all');

        cols[0] = this.f_createColumn(g_lang.m_nwRoutDestNetwork, 110, 'textField', '3', true, 'center');
        cols[1] = this.f_createColumn(g_lang.m_nwRoutDestNwMask, 110, 'textField', '3', true, 'center');
        //cols[2] = this.f_createColumn(g_lang.m_nwRoutConf, 200, 'div', '3', false, 'center');
        cols[2] = this.f_createColumn(g_lang.m_nwGateway, 120, 'textField', '3', true, 'center');
        cols[3] = this.f_createColumn(g_lang.m_nwRoutMetric, 90, 'textField', '3', true, 'center');
        cols[4] = this.f_createColumn(chkbox, 55, 'checkbox', 3, false, 'center');
        cols[5] = this.f_createColumn(g_lang.m_fireCustDelete, 70, 'combo', '3', false, 'center');

        return cols;
    }

    this.f_createRoutingRecord = function(ruleNo)
    {
        return new UTM_nwRoutingRecord(ruleNo);
    }

    this.f_sendSetCommand = function(rec, name, value, wantCB)
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_enabledActionButtons(true);

            if(wantCB != null)
                wantCB(evt);
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_setFirewallCustomize(rec, name, value, cb);
    }

    this.f_loadVMData = function()
    {
        thisObj.m_updateFields = [];

        thisObj.m_cb = function(evt)
        {
            g_utils.f_cursorDefault();

            if(evt != undefined && evt.m_objName == 'UTM_eventObj')
            {
                if(evt.m_value != null)
                {
                    thisObj.m_rRecs = evt.m_value;
                    thisObj.f_populateTable();
                    thisObj.f_updateGridHeaderChkbox();
                }
            }
        };

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getNwRoutingList(thisObj.m_cb);
    };

    this.f_stopLoadVMData = function()
    {
        //thisObj.m_busLayer.f_cancelFirewallCustomizeRule(null);
    }

    this.f_populateTable = function()
    {
        this.f_removeDivChildren(thisObj.m_div);
        this.f_removeDivChildren(thisObj.m_gridBody);
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_nwRoutingGridHeaderClick");
        this.m_div.appendChild(thisObj.f_headerText());
        this.m_div.appendChild(thisObj.m_gridHeader);
        this.m_div.appendChild(thisObj.m_gridBody);
        this.m_div.appendChild(thisObj.m_buttons);

        var sortCol = UTM_confNwRouting.superclass.m_sortCol;
        var ar = thisObj.f_createSortingArray(sortCol, thisObj.m_rRecs);

        for(var i=0; i<ar.length; i++)
            thisObj.f_addRoutingIntoRow(ar[i]);

    }

    this.f_createSortingArray = function(sortIndex, rRecs)
    {
        var ar = new Array();
        var recs = new Array();

        for(var i=0; i<rRecs.length; i++)
        {
            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = rRecs[i].m_destIpAddr + '|' + rRecs[i].m_destIpMask + '|' +
                    rRecs[i].m_isGateway + "|" + rRecs[i].m_gwOrInterface +
                    '|' + rRecs[i].m_metric + "|" +
                    rRecs[i].m_enabled + "|" + rRecs[i].m_ruleNo;
        }

        var sar = thisObj.f_sortArray(sortIndex, ar);
        for(var i=0; i<sar.length; i++)
        {
            var r = sar[i].split("|");
            var rec = thisObj.f_createRoutingRecord(r[6]);
            rec.m_destIpAddr = r[0];
            rec.m_destIpMask = r[1];
            rec.m_isGateway = r[2]=="true"? true: false;
            rec.m_gwOrInterface = r[3];
            rec.m_metric = r[4];
            rec.m_enabled = r[5];
            recs.push(rec);
        }

        return recs;
    }

    this.f_addRoutingIntoRow = function(rRec)
    {
        var zpRule = rRec.m_ruleNo;
        var gwRdId = thisObj.m_gwId + zpRule;
        var intRdId = thisObj.m_intId + zpRule;

        var gw = this.f_renderRadio(rRec.m_isGateway?"yes":"no", gwRdId,
                        "f_nwRoutingRadioHandler('" + gwRdId + "')", "option"+zpRule, "");
        var inter = this.f_renderRadio(rRec.m_isGateway?"no":"yes", intRdId,
                        "f_nwRoutingRadioHandler('" + intRdId + "')", "option"+zpRule, "");

        var dip = thisObj.f_renderTextField(thisObj.m_fieldIds[1]+zpRule,
                            rRec.m_destIpAddr, '', 100,
                            ["f_nwRoutingOnTFBlur('" + thisObj.m_fieldIds[1]+
                            zpRule + "')"], false);
        var dmip = thisObj.f_renderTextField(thisObj.m_fieldIds[2]+zpRule,
                            rRec.m_destIpMask, '', 100,
                            ["f_nwRoutingOnTFBlur('" + thisObj.m_fieldIds[2]+
                            zpRule + "')"], false);
        var opt = "<div align=center>Gateway: "+gw+
                  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Interface: "+inter+"</div>";
        var gwInterface = thisObj.f_createGWInterfaceDiv(rRec);
        var metric = thisObj.f_renderTextField(thisObj.m_fieldIds[6]+zpRule,
                            rRec.m_metric, '', 80,
                            ["f_nwRoutingOnTFBlur('" + thisObj.m_fieldIds[6]+
                            zpRule + "')"], false);
        var enable = "<div align=center>" + thisObj.f_renderCheckbox(
                  rRec.m_enabled, thisObj.m_fieldIds[7]+zpRule,
                  "f_nwRouteEnabledOnChkClick('"+thisObj.m_fieldIds[7]+zpRule+"')",
                  "") + "</div>";
        var del = "<div align=center>" + thisObj.f_renderButton(
                  "delete", true, "f_nwRoutingDeleteHandler(" + rRec.m_ruleNo +
                  ")", "") + "</div>";

        ///////////////////////////////////
        // add fields into grid view
        var div = thisObj.f_createGridRow(thisObj.m_colModel,
                    [dip, dmip, gwInterface, metric, enable, del]);
        thisObj.m_gridBody.appendChild(div);
    };

    this.f_createGWInterfaceDiv = function(rRec)
    {
        var div = "<div id=" + thisObj.m_gwIntDivId + rRec.m_ruleNo + ">";

        if(rRec.m_isGateway)
            div += thisObj.f_createGatewayTextField(rRec);
        else
            div += thisObj.f_createInterfaceCombo(rRec);
              
        div += "</div>";
        return div;
    }

    this.f_createGatewayTextField = function(rRec)
    {
        return thisObj.f_renderTextField(thisObj.m_fieldIds[4]+rRec.m_ruleNo,
                      rRec.m_gwOrInterface, '', 110,
                      ["f_nwRoutingOnTFBlur('" + thisObj.m_fieldIds[4]+
                      rRec.m_ruleNo + "')"], false);
    }

    this.f_createInterfaceCombo = function(rRec)
    {
        return thisObj.f_renderCombobox(thisObj.m_protocol, rRec.m_gwOrInterface, 110,
                            thisObj.m_fieldIds[5]+rRec.m_ruleNo,
                            ["f_nwRoutingOnCbbBlur('" + thisObj.m_fieldIds[5]+
                            rRec.m_ruleNo + "')"]);
    }
    this.f_handleAddRoutingRow = function(ruleNo)
    {
        var rr = thisObj.f_createRoutingRecord(ruleNo);
        thisObj.m_rRecs.push(rr);
        thisObj.f_addRoutingIntoRow(rr);
    };

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colModel, col))
            thisObj.f_populateTable();
    };

    this.f_init = function()
    {
        this.m_colModel = this.f_createColumns();
        this.m_gridHeader = this.f_createGridHeader(this.m_colModel, "f_nwRoutingGridHeaderClick");
        this.m_gridBody = this.f_createGridView(this.m_colModel, false);
        this.f_loadVMData();

        var btns = [['Add', "f_nwRoutingAddHandler()",
                    g_lang.m_fireCustAddTip, this.m_btnAddId],
                    ['Apply', "f_nwRoutingSaveHandler()",
                    g_lang.m_fireCustSaveTip, this.m_btnSaveId],
                    ['Cancel', "f_nwRoutingCancelHandler()",
                    g_lang.m_fireCustCancelTip, this.m_btnCancelId]];
        this.m_buttons = this.f_createButtons(btns);

        window.setTimeout(function()
        {
            thisObj.f_enabledActionButtons(false);
        }, 100);

        return [this.f_headerText(), this.m_gridHeader, this.m_gridBody, this.m_buttons];
    };

    this.f_initGridDiv = function(children)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'auto';
        div.style.height = "300";
        div.style.width = "702px";

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        return div;
    };

    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_nwRoutHeader+"<br><br>");
    };

    this.f_enabledActionButtons = function(enabled)
    {
        thisObj.f_enabledDisableButton(thisObj.m_btnSaveId, enabled);
        thisObj.f_enabledDisableButton(thisObj.m_btnCancelId, enabled);
    };

    this.f_handleIPAddressOnBlur = function(tfeid, cidr)
    {
        var tf = document.getElementById(tfeid);
        var ip = tf.value;

        if(ip.length == 0 && tfeid.indexOf(thisObj.m_fieldIds[4] >= 0))
            return;

        ///////////////////////////////
        // validate ip address
        if(!g_utils.f_validateIP(ip))
        {
            g_utils.f_popupMessage(g_lang.m_invalidIpAddr + " : " + ip, "error",
                          g_lang.m_ipaddrTitle, true);
            tf.focus();
            return;
        }

        ////////////////////////////////////////////
        // check netmask textfield
        var fIds = tfeid.split("-");
        var newCidr = cidr;
        var fName = "daddr";
        var rRec = thisObj.f_createRoutingRecord(fIds[1]);

        ///////////////////////////////
        // gateway textfield
        if(tfeid.indexOf(thisObj.m_fieldIds[4]) >= 0)
        {
            fName = "gateway";
            //thisObj.f_sendSetCommand(rRec, fName, ip);
        }
        else if(cidr == null)
        {
            var snm = document.getElementById(thisObj.m_fieldIds[2]+fIds[1]);
            if(g_utils.f_validateNetmask(snm.value))
            {
                newCidr = g_utils.f_convertNetmaskToCIDR(snm.value);
                
                //thisObj.f_sendSetCommand(rRec, fName, ip+"/"+newCidr);
            }
        }
        else
        {
            //thisObj.f_sendSetCommand(rRec, fName, ip+"/"+newCidr);
        }
    }

    this.f_handleNetMaskOnBlur = function(tfeid)
    {
        var tf = document.getElementById(tfeid);
        var cidr = null;

        if(g_utils.f_validateNetmask(tf.value))
            cidr = g_utils.f_convertNetmaskToCIDR(tf.value);
        else
        {
            alert('netmask invalidate');
            return;
        }

        ////////////////////////////////////////////
        // check ip address textfield
        var fIds = tfeid.split("-");
        this.f_handleIPAddressOnBlur(this.m_fieldIds[1]+fIds[1], cidr);

        return;
    };

    this.f_updateGridHeaderChkbox = function()
    {
        var checked = true;

        for(var i=0; i<this.m_rRecs.length; i++)
        {
            var rec = this.m_rRecs[i];
            var el = document.getElementById(this.m_fieldIds[7]+rec.m_ruleNo);

            if(el != null)
            {
                if(!el.checked)
                {
                    checked = false;
                    break;
                }
            }
        }

        var el = document.getElementById(this.m_enabledChkId);
        el.checked = checked;
    }

    this.f_setEnableValue2Server = function()
    {
        var cb = function(evt)
        {
            if(evt.m_errCode != 0)
                alert("set enable error: " + evt.m_errMsg + " for " + eid);

            if(thisObj.m_sendList.length > 0)
                thisObj.f_setEnableValue2Server();
        }

        var eid = this.m_sendList.pop();
        if(eid != null)
        {
            ///////////////////////////////////////////
            // submit set to server.
            var el = document.getElementById(eid);
            var ids = eid.split("-");
            var rec = thisObj.f_createRoutingRecord(ids[1]);

            rec.m_enable = el.checked ? 'Yes' : 'No';
            thisObj.f_sendSetCommand(rec, "enable", el.checked ? "Yes":"No", cb);
        }
    }

    this.f_chkOnSelected = function(chkid)
    {
        var chk = document.getElementById(chkid);

        /////////////////////////
        // enabled from column
        if(chkid == this.m_enabledChkId)
        {
            for(var i=0; i<thisObj.m_rRecs.length; i++)
            {
                var rec = thisObj.m_rRecs[i];
                var eeid = thisObj.m_fieldIds[7] + rec.m_ruleNo;
                var eel = document.getElementById(eeid);

                if(eel != null)
                {
                    if(eel.checked != chk.checked)
                        this.m_sendList.push(eeid);

                    eel.checked = chk.checked;
                }
            }
        }
        ///////////////////////////
        // enabled from row
        else if(chkid.indexOf(thisObj.m_fieldIds[7]) >= 0)
        {
            this.f_updateGridHeaderChkbox();
            this.m_sendList.push(chkid);
            
        }

        this.f_setEnableValue2Server();
    };

    this.f_cbOnSelected = function(cbeid)
    {
        var cbb = document.getElementById(cbeid);
        var rNo = cbeid.split("-");
        var fireRec = thisObj.f_createRoutingRecord(rNo[2]);

        
        /////////////////////////////
        // protocol cbb changed
        if(cbeid.indexOf(thisObj.m_fieldIds[3]) >= 0)
        {
            var dport = document.getElementById(thisObj.m_fieldIds[9]+rNo[1]+"-"+rNo[2]);
            var service = document.getElementById(thisObj.m_fieldIds[2]+rNo[1]+"-"+rNo[2]);

            var senddport = function(fr, val)
            {
                if(val != null)
                    thisObj.f_sendSetCommand(fr, "dport", val);
            }

            fireRec.m_protocol = cbb.value;
            fireRec.m_appService = service.value;
            thisObj.f_sendSetCommand(fireRec, "protocol", cbb.value);

            dport.value = thisObj.m_fwObj.f_getPortNumber(fireRec);
            window.setTimeout(function(){senddport(fireRec, dport.value)}, 100);

        }
        ////////////////////////////////////////
        // action cbb changed
        else if(cbeid.indexOf(thisObj.m_fieldIds[10]) >= 0)
        {
            var act = document.getElementById(thisObj.m_fieldIds[10]+rNo[1]+"-"+rNo[2]);
            thisObj.f_sendSetCommand(fireRec, "action", act.value);
        }
    };

    this.m_handleRadioChanged = function(rid)
    {
        var inputFd = "";
        var id = rid.split("-");
        var rRec = thisObj.f_createRoutingRecord(id[1]);

        if(rid.indexOf(thisObj.m_gwId) >= 0)
        {
            inputFd = thisObj.f_createGatewayTextField(rRec);
        }
        else
        {
            inputFd = thisObj.f_createInterfaceCombo(rRec);
        }

        var div = document.getElementById(thisObj.m_gwIntDivId+rRec.m_ruleNo);
        div.innerHTML = inputFd;
    }

    this.f_handleAddAction = function()
    {
        thisObj.f_enabledActionButtons(true);
        thisObj.f_handleAddRoutingRow(thisObj.tempRuleNo++);
        //thisObj.f_handleAddFirewallCustomRow(thisObj.f_getTheNextRuleNo(null));
    }

    this.f_handleSaveAction = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            thisObj.f_loadVMData();
        };

        thisObj.f_enabledActionButtons(false);
        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_saveFirewallCustomizeRule(cb);
    };

    this.f_handleCancelAction = function()
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
        };

        g_utils.f_cursorWait();
        thisObj.f_enabledActionButtons(false);
        thisObj.m_busLayer.f_cancelFirewallCustomizeRule(cb);
    };

    this.f_handleDeleteRule = function(ruleNo)
    {
        var cb = function(evt)
        {
            thisObj.f_loadVMData();
            thisObj.f_enabledActionButtons(true);
        };

        g_utils.f_cursorWait();
        var fireRec = thisObj.f_createRoutingRecord(ruleNo);
        thisObj.m_busLayer.f_deleteFirewallCustomizeRule(fireRec, cb);
    }
}
UTM_extend(UTM_confNwRouting, UTM_confBaseObj);

function f_nwRoutingAddHandler()
{
    g_configPanelObj.m_activeObj.f_handleAddAction();
}

function f_nwRoutingSaveHandler()
{
    g_configPanelObj.m_activeObj.f_handleSaveAction();
}

function f_nwRoutingCancelHandler()
{
    g_configPanelObj.m_activeObj.f_handleCancelAction();
}

function f_nwRoutingDeleteConfirm(ruleNo)
{
    g_configPanelObj.m_activeObj.f_handleDeleteRule(ruleNo);
}
function f_nwRoutingDeleteHandler(ruleNo)
{
    g_utils.f_popupMessage(g_lang.m_fireDeleteConfirm,
                'confirm', g_lang.m_fireCustDeleteConfirmHeader, true,
                "f_f_nwRoutingDeleteConfirm('" + ruleNo + "')");
}

function f_nwRoutingRadioHandler(rid)
{
    g_configPanelObj.m_activeObj.m_handleRadioChanged(rid);
}

function f_nwRoutingOnTFBlur(tfeid)
{
    var aObj = g_configPanelObj.m_activeObj;

    // ip address text fields
    if(tfeid.indexOf(aObj.m_fieldIds[1]) >= 0 ||
        tfeid.indexOf(aObj.m_fieldIds[4]) >= 0)
        aObj.f_handleIPAddressOnBlur(tfeid, null);
    // net mask text fields
    else if(tfeid.indexOf(aObj.m_fieldIds[2]) >= 0)
        aObj.f_handleNetMaskOnBlur(tfeid);
}

function f_nwRoutingOnCbbBlur(cbeId)
{
    g_configPanelObj.m_activeObj.f_cbOnSelected(cbeId);
}

function f_nwRouteEnabledOnChkClick(chkid)
{
    g_configPanelObj.m_activeObj.f_chkOnSelected(chkid);
}

function f_nwRoutingGridHeaderClick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}