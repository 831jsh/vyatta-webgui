/*
 Document   : utm_confUrlEzByUrl.js
 Created on : Apr 01, 2009, 11:21:31 AM
 Author     : Loi.Vo
 Description:
 */
function UTM_confUrlEzByKeyword(name, callback, busLayer)
{
    var thisObj = this;
    this.thisObjName = 'utm_confUrlEzByKeyword';
    this.m_btnCancelId = 'conf_url_ez_by_keyword_btn_cancel';
    this.m_btnApplyId = 'conf_url_ez_by_keyword_btn_apply';
    this.m_btnAddId = 'conf_url_ez_by_keyword_btn_add';
    this.m_btnBackId = 'conf_url_ez_by_keyword_btn_back';
    this.m_body = undefined;
    this.m_row = 0;
    this.m_cnt = 0;
    
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
        UTM_confUrlEzByKeyword.superclass.constructor(name, callback, busLayer);
    }
    this.privateConstructor(name, callback, busLayer);
    
    this.f_getConfigurationPage = function()
    {
        var div = this.f_getPanelDiv(this.f_init());
        this.f_loadVMData();
        return div;
    }
    
    this.f_init = function()
    {
        this.m_hdcolumns = this.f_createHdColumns();
        this.m_header = this.f_createGridHeader(this.m_hdcolumns, '');
        this.m_body = this.f_createGridView(this.m_hdcolumns, true);
        
        var addBtn = [['AddInner', "f_confUrlEzByKeywordHandleAdd('" + this.m_btnAddId + "')", 'Tools tip for add', this.m_btnAddId]];
        this.m_addButton = this.f_createButtons(addBtn);
        this.m_addButton.style.borderLeft = '1px solid #CCCCCC';
        this.m_addButton.style.borderRight = '1px solid #CCCCCC';
        this.m_addButton.style.borderBottom = '1px solid #CCCCCC';
		this.m_addButton.style.width = '555px';
        //this.m_addButton.style.borderTop = '1px solid #CCCCCC';	
        this.m_addButton.style.marginTop = '-5px';
        
        var btns = [['Back', "f_confUrlEzByKeywordHandleBack('" + this.m_btnBackId + "')", 'Tools tip for back', this.m_btnBackId],
		            ['Cancel', "f_confUrlEzByKeywordHandleCancel('" + this.m_btnCancelId + "')", 'Tools tip for cancel', this.m_btnCancelId], 
					['Apply', "f_confUrlEzByKeywordHandleApply('" + this.m_btnApplyId + "')", 'Tools tip for apply', this.m_btnApplyId]];
        this.m_buttons = this.f_createButtons(btns);
        
        //this.f_loadVMData();
        
        return [this.f_headerText(), this.m_header, this.m_body, this.m_addButton, this.m_buttons];
    }
    
    this.f_headerText = function()
    {
        return this.f_createGeneralDiv(g_lang.m_vpnOverviewHeader + "<br><br>");
    }
    
    this.f_createHdColumns = function()
    {
        this.f_colorGridBackgroundRow(true);
        var cols = [];
        var chkbox = g_lang.m_enabled + '<br>' +
        thisObj.f_renderCheckbox('no', 'conf_url_ez_by_keyword_enable_cb', "f_confUrlEzByKeywordHandleEnableCb('conf_url_ez_by_keyword_enable_cb')", 'tooltip');
        
        cols[0] = this.f_createColumn(g_lang.m_url_ezBannedKeywordInUrl + '<br>', 415, 'textField', '5', false, 'center');
        cols[1] = this.f_createColumn(chkbox, 70, 'checkbox', '28');
        cols[2] = this.f_createColumn(g_lang.m_delete + '<br>', 70, 'image', '28');
        
        return cols;
    }
    
    this.f_enableAll = function()
    {
        var cb = document.getElementById('conf_url_ez_by_keyword_enable_cb');
        if (cb.checked) {
            ;
        } else {
            ;
        }
    }
    
    this.f_addRow = function()
    {
        var prefix = 'utm_conf_url_ez_by_keyword_';
        var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, '', '', 400);
        var cb = thisObj.f_renderCheckbox('no', prefix + 'cb_' + thisObj.m_cnt, '', '');
        var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByKeywordHandleDeleteCb('" +
        prefix +
        'addr_' +
        thisObj.m_cnt +
        "')", 'delete row');
        var data = [addr, cb, del];
        var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28);
        thisObj.m_body.appendChild(bodyDiv);
        thisObj.m_cnt++;
        
        thisObj.f_adjustDivPositionByPixel(thisObj.m_addButton, thisObj.f_getTableHeight() - 40);
        thisObj.f_adjustDivPositionByPixel(thisObj.m_buttons, thisObj.f_getTableHeight() - 30);
        thisObj.f_resize();
    }
    
	this.f_apply = function()
	{
		
	}
	
	this.f_reset = function()
	{
		
	}
	
    this.f_handleClick = function(id)
    {
        if (id == thisObj.m_btnCancelId) {
            thisObj.f_reset();
        } else if (id == thisObj.m_btnApplyId) {
            thisObj.f_apply();
        } else if (id == thisObj.m_btnAddId) {
            thisObj.f_addRow();
        } else if (id == thisObj.m_btnBackId) {
		    g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_ID);
        
        }
    }
    
    this.f_loadVMData = function()
    {
        thisObj.f_populateTable();
        //        var cb = function(evt)
        //        {
        //            g_utils.f_cursorDefault();
        //            if(evt != undefined && evt.m_objName == 'FT_eventObj')
        //            {
        //                thisObj.f_populateTable();
        //            }
        //        }
    
        //g_utils.f_cursorWait();
        //this.m_threadId = this.m_busLayer.f_startVMRequestThread(cb);
    }
    
    this.f_getTableHeight = function()
    {
        var h = thisObj.m_tableRowCounter * 28;
        return h;
    }
    
    this.f_populateTable = function()
    {
        var a = ['http://www.facebook.com', 'http://www.vyatta.com', 'http://www.cisco.com', 'http://www.sun.com', 'http://www.juniper.net', ' '];
        for (var i = 0; i < a.length; i++) {
            var prefix = 'utm_conf_url_ez_by_keyword_';
            var addr = thisObj.f_renderTextField(prefix + 'addr_' + thisObj.m_cnt, a[i], '', 400);
            var cb = thisObj.f_renderCheckbox('no', prefix + 'cb_' + thisObj.m_cnt, '', '');
            var del = thisObj.f_renderButton('delete', true, "f_confUrlEzByKeywordHandleDeleteCb('" +
            prefix +
            'addr_' +
            thisObj.m_cnt +
            "')", 'delete row');
            var data = [addr, cb, del];
            var bodyDiv = thisObj.f_createGridRow(thisObj.m_hdcolumns, data, 28);
            thisObj.m_body.appendChild(bodyDiv);
            thisObj.m_cnt++;
        }
        thisObj.f_adjustDivPositionByPixel(thisObj.m_addButton, thisObj.f_getTableHeight() - 40);
        thisObj.f_adjustDivPositionByPixel(thisObj.m_buttons, thisObj.f_getTableHeight() - 30);
        thisObj.f_resize();
    }
    
    this.f_handleGridSort = function(col)
    {
    }
    
    this.f_handleCheckboxClick = function(chkbox)
    {
    
    }
    
    this.f_stopLoadVMData = function()
    {
    }
}

UTM_extend(UTM_confUrlEzByKeyword, UTM_confBaseObj);


function f_confUrlEzByKeywordHandleCancel(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByKeywordHandleAdd(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByKeywordHandleApply(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByKeywordHandleBack(id)
{
    g_configPanelObj.m_activeObj.f_handleClick(id);
}

function f_confUrlEzByKeywordHandleEnableCb(e)
{
    g_configPanelObj.m_activeObj.f_enableAll();
}

function f_confUrlEzByKeywordHandleDeleteCb(id)
{
    alert('delete called: ' + id);
}
