/*
 Document   : utm_confUrlEz.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description:
 */
function UTM_confUrlEz(name, callback, busLayer)
{
    /**
     ***************************************************************************
     * id naming convention
     *    -monday, hour=1:
     *                  img id= 'img_m.1'
     *                  cb id= 'cb_m.1'
     *                  always_on img_id = 'on_img_m'
     *                  always_on cb_id = 'on_cb_m'
     *                  always_off img_id = 'off_img_m'
     *                  always_off cb_id = 'off_cb_m'
     ****************************************************************************
     */
    var thisObjName = 'UTM_confVpnEz';
    var thisObj = this;
    this.m_form = undefined;
    this.m_ufcObj = undefined;
    this.m_dowArray = ['m', 't', 'w', 'h', 'f', 'a', 's'];
    this.m_catArray = ['blacklist', 'whitelist', 'keyword', 'legal', 'productivity', 'strict'];
    
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
        UTM_confUrlEz.superclass.constructor(name, callback, busLayer);
    }
    
    this.privateConstructor(name, callback, busLayer);
    
    this.f_init = function()
    {
        this.f_setConfig({
            id: 'conf_url_ez',
            width: '500',
            items: [{
                v_type: 'label',
                text: g_lang.m_url_ezFilterPolicy,
                v_new_row: 'true',
                v_end_row: 'true'
            }, EMPTY_ROW, {
                v_type: 'html',
                id: 'conf_url_ez_blacklist',
                text: '<input id="conf_url_ez_blacklist" type="checkbox" name="filter_by" value="cat" checked>&nbsp;' + g_lang.m_url_ezByCat,
                padding: '30px',
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_legal',
                padding: '60px',
                text: '<input id="conf_url_ez_legal" type="radio" name="filter_by_cat" value="legal" checked>&nbsp;' + g_lang.m_url_ezLegal,
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_productivity',
                padding: '60px',
                text: '<input id="conf_url_ez_productivity" type="radio" name="filter_by_cat" value="prof">&nbsp;' + g_lang.m_url_ezProf,
                v_new_row: 'true',
                v_end_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_strict',
                padding: '60px',
                text: '<input id="conf_url_ez_strict" type="radio" name="filter_by_cat" value="strict">&nbsp;' + g_lang.m_url_ezStrict,
                v_new_row: 'true',
                v_end_row: 'true'
            }//,  EMPTY_ROW
, {
                v_type: 'html',
                id: 'conf_url_ez_whitelist',
                text: '<input id="conf_url_ez_whitelist" type="checkbox" name="filter_by" value="url">&nbsp;' + g_lang.m_url_ezByUrl,
                padding: '30px',
                v_new_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_whitelist_config',
                text: '<input type="image" id="conf_url_ez_whitelist_config" src="' + g_lang.m_imageDir + 'bt_config.png">',
                v_end_row: 'true'
            }//,  EMPTY_ROW
, {
                v_type: 'html',
                id: 'conf_url_ez_keyword',
                text: '<input id="conf_url_ez_keyword" type="checkbox" name="filter_by" value="url">&nbsp;' + g_lang.m_url_ezByWord,
                padding: '30px',
                v_new_row: 'true'
            }, {
                v_type: 'html',
                id: 'conf_url_ez_keyword_config',
                text: '<input type="image" id="conf_url_ez_keyword_config" src="' + g_lang.m_imageDir + 'bt_config.png">',
                v_end_row: 'true'
            }, EMPTY_ROW, {
                v_type: 'label',
                text: g_lang.m_url_ezFilterPolicyImp,
                v_new_row: 'true',
                v_end_row: 'true'
            }, EMPTY_ROW, {
                v_type: 'html',
                text: '<div><table id="conf_url_ez_time_table" cellpadding= "0" cellspacing="0"><tbody id="conf_url_ez_time_table_body"><tr>' +
                '<td align="center" class="maintd_bold">' +
                g_lang.m_url_ezDay +
                '</td>' +
                '<td align="center" class="maintd_bold">' +
                g_lang.m_url_ezTime +
                '</td>' +
                '<td align="center" class="maintd_bold"><br/>' +
                g_lang.m_url_ezAlways +
                '<br/>' +
                g_lang.m_url_ezOn +
                '</td>' +
                '<td align="center" class="maintd_bold"><br/>' +
                g_lang.m_url_ezAlways +
                '<br/>' +
                g_lang.m_url_ezOff +
                '</td>' +
                '</tr></tbody></table></div>',
                v_new_row: 'true',
                v_end_row: 'true',
                colspan: 3
            }],
            buttons: [{
                id: 'conf_url_ez_apply_button',
                align: 'right',
                text: 'Apply',
                onclick: this.f_handleClick
            }, {
                id: 'conf_url_ez_cancel_button',
                align: 'right',
                text: 'Cancel',
                onclick: this.f_handleClick
            }]
        })
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
        var txt = 'Lorem ipsum onsectetuer adipiscing elit, sed diam ' +
        'nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam ' +
        'erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci ' +
        'tation ullamcorper suscipit lobortis nisl ut aliquip ex ea ' +
        'commodo consequat.<br>';
        
        return this.f_createGeneralDiv(txt);
    }
    
    this.f_initFilterPolicyImp = function()
    {
        var days = g_lang.m_url_ezDayArray;
        for (var i = 0; i < days.length; i++) {
            thisObj.f_addRow(thisObj.m_dowArray[i], days[i]);
        }
    }
    
    this.f_addRow = function(dayId, text)
    {
        var el = document.getElementById('conf_url_ez_time_table_body');
        var tr = document.createElement('tr');
        tr.appendChild(thisObj.f_createDayOfWeek(dayId, text));
        tr.appendChild(thisObj.f_createTimeTable(dayId, text));
        tr.appendChild(thisObj.f_createAlwaysOn(dayId, text));
        tr.appendChild(thisObj.f_createAlwaysOff(dayId, text));
        el.appendChild(tr);
    }
    
    this.f_createDayOfWeek = function(dayId, text)
    {
        var td = document.createElement('td');
        td.id = 'day_' + dayId;
        td.className = 'maintd_bold';
        td.setAttribute('align', 'center');
        td.innerHTML = text;
        return td;
    }
    
    this.f_createTimeTable = function(dayId, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        td.setAttribute('align', 'center');
        td.appendChild(thisObj.f_createTimeTableDiv(dayId, text));
        return td;
    }
    
    this.f_createTimeTableDiv = function(dayId, text)
    {
        var div = document.createElement('div');
        div.className = 'date_row';
        var innerHTML = '<table cellpadding="0" cellspacing="1" align="center" border="0"><tr>';
        for (var i = 0; i < 24; i++) {
            var tdId = 'time_td_' + dayId + '.' + i;
            innerHTML += '<td id="' + tdId + '" class="cell" valign="bottom">';
            if (i < 10) {
                innerHTML += '&nbsp;';
            }
            var id = 'img_' + dayId + '.' + i;
            innerHTML += i + '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\')' +
            ' src="' +
            g_lang.m_imageDir +
            'red10x10.png">';
            innerHTML += '<input style="display:none" type="checkbox" id="cb_' + dayId + '.' + i + '" >' + '</td>';
        }
        innerHTML += '</tr></table>';
        div.innerHTML = innerHTML;
        return div;
    }
    
    this.f_createAlwaysOn = function(dayId, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        td.setAttribute('align', 'center');
        var id = 'on_img_' + dayId;
        var innerHTML = '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\') src="' + g_lang.m_imageDir + 'blank14x14.png">';
        innerHTML += '<input style="display:none" type="checkbox" id="on_img_cb_' + dayId + '">' + '</td>';
        td.innerHTML = innerHTML;
        return td;
    }
    
    this.f_createAlwaysOff = function(dayId, text)
    {
        var td = document.createElement('td');
        td.className = 'maintd';
        var id = 'off_img_' + dayId;
        td.setAttribute('align', 'center');
        var innerHTML = '<img id="' + id + '" onclick=f_checkImage(\'' + id + '\') src="' + g_lang.m_imageDir + 'blank14x14.png">';
        innerHTML += '<input style="display:none" type="checkbox" id="off_img_cb_' + dayId + '">' + '</td>';
        td.innerHTML = innerHTML;
        return td;
    }
    
    this.f_enableTimeBackground = function(dayId, enable)
    {
        var tdId = 'time_td_' + dayId + '.';
        for (var i = 0; i < 24; i++) {
            var id = tdId + i;
            var td = document.getElementById(id);
            if (enable) {
                td.bgColor = '#FFFFFF';
            } else {
                td.bgColor = '#A9A9A9';
            }
        }
    }
    
    this.f_enableTimeHour = function(dayId, hour, enable)
    {
        var imgId = 'img_' + dayId + '.';
        var cbId = 'cb_' + dayId + '.';
        
        var id = imgId + hour;
        var img = document.getElementById(id);
        id = cbId + hour;
        var cb = document.getElementById(id);
        
        if (enable) {
            img.src = g_lang.m_imageDir + 'green10x10.png';
            cb.checked = 'checked';
        } else {
            img.src = g_lang.m_imageDir + 'red10x10.png';
            cb.checked = '';
        }
    }
    
    this.f_enableTime = function(dayId, enable)
    {
        var imgId = 'img_' + dayId + '.';
        var cbId = 'cb_' + dayId + '.';
        
        for (var i = 0; i < 24; i++) {
            thisObj.f_enableTimeHour(dayId, i, enable);
        }
    }
    
    this.f_disableAlwaysOn = function(dayId)
    {
        var cb = document.getElementById('on_img_cb_' + dayId);
        var img = document.getElementById('on_img_' + dayId);
        if (cb.checked) {
            cb.checked = '';
            img.src = g_lang.m_imageDir + 'blank14x14.png';
        }
    }
    
    this.f_disableAlwaysOff = function(dayId)
    {
        var cb = document.getElementById('off_img_cb_' + dayId);
        var img = document.getElementById('off_img_' + dayId);
        if (cb.checked) {
            cb.checked = '';
            img.src = g_lang.m_imageDir + 'blank14x14.png';
        }
    }
    
    this.f_readOnly = function(dayId)
    {
        var cbOn = document.getElementById('on_img_cb_' + dayId);
        if (cbOn.checked) {
            return true;
        }
        var cbOff = document.getElementById('off_img_cb_' + dayId);
        if (cbOff.checked) {
            return true;
        }
        return false;
    }
    
    this.f_toggleImage = function(id)
    {
        if (id.indexOf('on_img_') > -1) {
            var dayId = id.substring(7, id.length);
            var cb = document.getElementById('on_img_cb_' + dayId);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + 'blank14x14.png';
                thisObj.f_enableTimeBackground(dayId, true);
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + 'green14x14.png';
                thisObj.f_disableAlwaysOff(dayId);
                thisObj.f_enableTimeBackground(dayId, false);
                thisObj.f_enableTime(dayId, true);
            }
        } else if (id.indexOf('off_img_') > -1) {
            var dayId = id.substring(8, id.length);
            var cb = document.getElementById('off_img_cb_' + dayId);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + 'blank14x14.png';
                thisObj.f_enableTimeBackground(dayId, true);
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + 'red14x14.png';
                thisObj.f_disableAlwaysOn(dayId);
                thisObj.f_enableTimeBackground(dayId, false);
                thisObj.f_enableTime(dayId, false);
            }
        } else {
            var dayId = id.substring(4, id.length);
            if (thisObj.f_readOnly(dayId.substring(0, 1))) {
                return;
            }
            var cb = document.getElementById('cb_' + dayId);
            var img = document.getElementById(id);
            if (cb.checked) {
                cb.checked = '';
                img.src = g_lang.m_imageDir + "red10x10.png";
            } else {
                cb.checked = 'checked';
                img.src = g_lang.m_imageDir + "green10x10.png";
            }
        }
    }
    
    this.f_loadPolicy = function()
    {
		//alert('f_loadPolicy: ufcObj.m_policy: ' + thisObj.m_ufcObj.m_policy.f_toXml());
        var a = thisObj.m_catArray;
        for (var i = 0; i < a.length; i++) {
            var v = thisObj.m_ufcObj.m_policy.f_getAttribute(a[i]);
            var elId = 'conf_url_ez_' + a[i];
            var el = document.getElementById(elId);
            
            if ((v != undefined) && (v != null) && (v == 'true')) {
                el.checked = 'checked';
            } else {
                el.checked = '';
            }
        }
    }
    
	this.f_printSchedule = function(d, t)
	{
		if (t==null) {
			//alert('timeArray is null for day: ' + d);
			return;
		}
		var ts = '-';
		for (var i=0; i < t.length; i++) {
			ts += 'h' + i + ':' + t[i] + '-';
		}
		//alert('day: ' + d + ' time: ' + ts);
	}
	
    this.f_loadSchedule = function()
    {
		//alert('f_loadSchedule: ufcObj.m_schedule: ' + thisObj.m_ufcObj.m_schedule.f_toXml());
        var dow = thisObj.m_dowArray;
        for (var i = 0; i < dow.length; i++) {
            var timeArray = thisObj.m_ufcObj.m_schedule.f_getScheduleByDay(dow[i]);
			thisObj.f_printSchedule(dow[i], timeArray);
            for (var j = 0; j < timeArray.length; j++) {
                if (timeArray[j] == 1) {
                    thisObj.f_enableTimeHour(dow[i], j, true);
                } else {
                    thisObj.f_enableTimeHour(dow[i], j, false);
                }
            }
        }
    }
    
    this.f_loadVMData = function(element)
    {		
	    //alert ('f_loadVMData called');
		
        thisObj.f_initFilterPolicyImp();
        thisObj.f_attachListener();
        thisObj.m_form = document.getElementById('conf_url_ez_form');
        thisObj.f_setFocus();
        thisObj.f_resize();
                
        var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);  
					thisObj.m_ufcObj = g_busObj.f_getUrlFilterObj().f_getDefaultUfc();   
					thisObj.f_loadPolicy();                
                    thisObj.f_loadSchedule(); 
                    return;                    
                }                
                thisObj.m_ufcObj = evt.m_value;    
				//alert('f_loadVMData: m_ufcObj.toXml: ' + thisObj.m_ufcObj.f_toXml());            
                thisObj.f_loadPolicy();                
                thisObj.f_loadSchedule();                
            }                                 
        };      
		
	    g_busObj.f_getUrlFilterConfig(cb);

    }
    
    this.f_attachListener = function()
    {
        var el = document.getElementById('conf_url_ez_whitelist_config');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
        el = document.getElementById('conf_url_ez_keyword_config');
        g_xbObj.f_xbAttachEventListener(el, 'click', thisObj.f_handleClick, false);
    }
    
    this.f_detachListener = function()
    {
        var el = document.getElementById('conf_url_ez_whitelist_config');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
        el = document.getElementById('conf_url_ez_keyword_config');
        g_xbObj.f_xbDetachEventListener(el, 'click', thisObj.f_handleClick, false);
    }
    
    
    this.f_setFocus = function()
    {
    
    }
    
    this.f_stopLoadVMData = function()
    {
    }
    
    this.f_validate = function()
    {
        return true;
    }
    
	this.f_applyPolicy = function()
	{
        var a = thisObj.m_catArray;
        for (var i = 0; i < a.length; i++) {
            var elId = 'conf_url_ez_' + a[i];
            var el = document.getElementById(elId);
            
			if (el.checked) {
				thisObj.m_ufcObj.m_policy.f_setAttribute(a[i],'true');
			} else {
				thisObj.m_ufcObj.m_policy.f_setAttribute(a[i], 'false');
			}
        }	
		//alert('apply policy: ' + thisObj.m_ufcObj.m_policy.f_toXml());	
	}
	
	this.f_applySchedule = function()
	{
        var dow = thisObj.m_dowArray;
        for (var i = 0; i < dow.length; i++) {
			var schedArray = new Array(24);
			var idPrefix = 'cb_' + dow[i] + '.';
			for (var j = 0; j < schedArray.length; j++) {
				var el = document.getElementById(idPrefix + j);
				if (el.checked) {
					schedArray[j] = 1;
				} else {
					schedArray[j] = 0;
				}
			}
			thisObj.m_ufcObj.m_schedule.f_setScheduleForDay(dow[i], schedArray);
		}
		//alert('apply schedule: ' + thisObj.m_ufcObj.m_schedule.f_toXml());		
	}
	
    this.f_apply = function()
    {	
		thisObj.f_applyPolicy();
		thisObj.f_applySchedule();
		
        var cb = function(evt)
        {        
            if (evt != undefined && evt.m_objName == 'UTM_eventObj') {            
                if (evt.f_isError()) {                
                    g_utils.f_popupMessage(evt.m_errMsg, 'ok', g_lang.m_error, true);                    
                    return;                    
                }                              
            }                                 
        };   
		   
		
		g_busObj.f_setUrlFilterConfig(thisObj.m_ufcObj, cb);		
    }
    
    this.f_reset = function()
    {
        var dow = thisObj.m_dowArray;
        for (var i = 0; i < dow.length; i++) {
			thisObj.f_enableTimeBackground(dow[i],true);
			thisObj.f_disableAlwaysOff(dow[i]);
			thisObj.f_disableAlwaysOn(dow[i]);
		}		
        thisObj.f_loadPolicy();                
        thisObj.f_loadSchedule();  
    }
    
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            return thisObj.f_handleClickById(id);
        }
    }
    
    this.f_handleClickById = function(id)
    {
        switch (id) {
            case 'conf_url_ez_whitelist_config':
                g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_BY_URL_ID);
                break;
            case 'conf_url_ez_keyword_config':
                g_configPanelObj.f_showPage(VYA.UTM_CONST.DOM_3_NAV_SUB_EASY_WEBF_BY_WORD_ID);
                break;
            case 'conf_url_ez_apply_button': //apply clicked
                if (!thisObj.f_validate()) {
                    return false;
                }
                thisObj.f_apply();
                break;
            case 'conf_url_ez_cancel_button': //cancel clicked
                thisObj.f_reset();
                break;
        }
        return false;
    }
    
}

UTM_extend(UTM_confUrlEz, UTM_confFormObj);

function f_checkImage(id)
{
    g_configPanelObj.m_activeObj.f_toggleImage(id);
}

