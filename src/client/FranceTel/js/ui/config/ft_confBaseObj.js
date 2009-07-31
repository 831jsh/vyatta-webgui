/*
    Document   : ft_confBaseObj.js
    Created on : Mar 02, 2009, 6:18:25 PM
    Author     : Kevin.Choi
    Description: a base object for all OA configuration screens
*/

function f_paginationCallback(pageNo)
{
    g_configPanelObj.m_activeObj.f_handlePagingCall(pageNo);
}

function FT_confBaseObj(name, callback, busLayer)
{
    var thisObj = this;
    this.m_pagingObj = null;
    this.m_allowSort = false;
    this.m_sortColPrev = -1;
    this.m_sortCol = 0;
    this.m_sortOrder = 'asc';   // asc or des
    this.m_id = undefined;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     */
    this.constructor = function(name, callback, busLayer)
    {
        this.privateConstructor(name, callback, busLayer);
    }

    this.privateConstructor = function(name, callback, busLayer)
    {
	this.m_busLayer = busLayer;
        this.m_name = name;
        this.m_containerCb = callback;
        this.m_treadId = null;
        this.m_allowSort = false;
        this.m_sortColPrev = -1;
        this.m_sortOrder = 'asc';
        this.m_pagingObj = null;
        this.m_id = undefined;
        this.m_tableRowCounter = 0;
    }
    this.privateConstructor(name, callback, busLayer);

    /**
     * call this function when this object is no longer used. it will
     * do all the clean up and stop the thread.
     */
    this.f_distructor = function()
    {
        if(this.m_treadId != null)
        {
            this.m_busLayer.f_stopVMRequestThread(this.m_treadId);
            this.m_threadId = null;
        }
        this.m_pagingObj = null;
    }

    this.f_setId = function(id) {
		this.m_id = id;
	}

    this.f_getNewPanelDiv = function(children)
    {
        var div = document.createElement('div');
        div.setAttribute('id', 'ft_confpanel_');
        div.setAttribute('align', 'left');

        /////////////////////////////////////////
        // set inner styling of the div tag
        //div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        //div.style.height = '300px';
        //div.style.overflow = 'visible';
        div.style.fontFamily = 'Arial, sans-serif';

        for(var i=0; i<children.length; i++)
            div.appendChild(children[i]);

        var ft = document.getElementById('ft_container');
		if (ft) {
		    ft.appendChild(div);
		}

        this.m_div = div;
        return this.m_div;
    }

    this.f_reflow = function()
    {
       var body = document.getElementsByTagName( "body" )[0];
       var bodyClass = body.className;

       body.className = "reflow";
       body.className = bodyClass;
    }

    this.f_resize = function(padding)
    {
	if (this.m_id !=  g_configPanelObj.m_selectedItem ||
            this.m_div == undefined)
	//to avoid the race condition between callback from server, and user click event.
            return;

        var h = 0;
        for (var i=0; this.m_div.childNodes[i]; i++) {
            h += this.m_div.childNodes[i].offsetHeight;
        }

        h = h + (thisObj.m_tableRowCounter * 31);
        if (padding) {
            h += padding;
        }

         this.m_div.style.height = h + 'px';
         var ft = document.getElementById('ft_container');
		 if (ft) {
		 	ft.style.height = h + 'px';
		 }
         this.f_reflow();
    }

    this.f_createGridHeader = function(header, onclick)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.border = '1px solid #CCC';
        div.style.backgroundColor = '#EFEFEF';//'#FF6600'
        div.style.overflow = 'visible';

        var width = 0;
        var inner = "";
        for(var i=0; i<header.length; i++)
        {
            var h = header[i];
            width += h[1]

            var cursor = '';
            var tooltip = '';
            var isSortable = false;
            var sortColor = "";
            if(h[4] != undefined && h[4])
            {
                tooltip = 'title="' + g_lang.m_tableTooltip1 + '" ';
                cursor = 'cursor:pointer; ';
                isSortable = true;

                if(thisObj.m_sortCol == i)
                    sortColor = "background-color:#939393;";
            }

            var colName = thisObj.f_createColNameHTML(h[0], i, isSortable);
            var rBorder = (i == header.length-1) || h[0].length < 2 ?
                              '' : 'border-right:1px solid #CCC; ';

            inner += '<td style="' + sortColor + ';" width="' + h[1] +'">' +
                '<div style="padding-top:5px; padding-bottom:5px; ' +
                cursor + rBorder + '" onclick="' + onclick + '(' + i + ')" ' +
                tooltip + '>' + colName + '</div></td>';
        }

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">' +
                      '<thead><tr height="25">' + inner +
                      '</tr></thead></table>';

        div.style.width = width + 'px';
        div.innerHTML = innerHtml;

        return div;
    }

    this.f_createGridView = function(header, pagingOn)
    {
        thisObj.m_tableRowCounter = 0;
        var div = document.createElement('div');
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '50px';
        div.style.overflow = 'visible';
        div.style.color = '#000';

        var width = 0;
        for(var i=0; i<header.length; i++)
        {
            var h = header[i];
            width += h[1]
        }

        div.style.width = (width) + 'px';

        ////////////////////////////////////
        //init paging object
        var isPagingOn = pagingOn == null ? false : pagingOn
        if(isPagingOn)
            thisObj.m_pagingObj = new FT_pagingObj(null, 1, g_oaConfig.m_oaNumRowPerPage);

        return div;
    };

    // insert a plain text row at the bottom of grid
    this.f_createGridMsgRow = function(text)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.borderBottom = '0px';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '3px';
        div.style.paddingBottom = '0px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="28" cellspacing="0" cellpadding="0">';

        innerHtml += '<td cellspacing="0" cellpadding="0">' +
                        '<div style="height:20px; color:red;' +
                        ' padding-top:0px; padding-bottom:0px; ' +
                        ' margin-top:0px; margin-bottom: 0px; ' +
                        'padding-left: 10px; padding-top: 5px;"><b>' +
                        text + '</b></div></td>';

        innerHtml += '</tr></tbody></table>' ;

        div.style.width = '700px';
        div.innerHTML = innerHtml;

        thisObj.m_tableRowCounter++;
        return div;
    }

    /**
     * create a grid row record div to be added into grid table
     */
    this.f_createGridRow = function(header, data, totalRecs)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.borderBottom = '1px dotted #CCC';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '3px';
        div.style.paddingBottom = '0px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="28" cellspacing="0" cellpadding="0">';

        var width = 0;
        for(var i=0; i<data.length; i++)
        {
            var h = header[i];
            width += h[1];
            var fWidth = i == 0 || i == data.length-1 ? h[1] : h[1];
            var lBorder = i == -1 ? 'border-left:1px solid #CCC; ' : '';
            var rBorder = '';

            //////////////////////////////
            // define padding
            var lPadding = h[3] == undefined ? "padding-left:5px; " :
                          'padding-left:' + h[3] + 'px; ';
            var tPadding = '5px';
            switch(h[2])
            {
                case 'text':
                case 'checkbox':
                    tPadding = '5px';
                    break;
                case 'image':
                    tPadding = '3px';
                    break;
                case 'button':
                    tPadding = '2px';
                    break;
                case 'progress':
                    tPadding = '2px';
                    break;
            }

            innerHtml += '<td cellspacing="0" cellpadding="0" width="' +
                        fWidth +'"><div style=" ' + lBorder + rBorder +
                        ' padding-top:0px; padding-bottom:0px; ' +
                        ' margin-top:0px; margin-bottom: 0px; ' +
                        lPadding + 'padding-top:' +
                        tPadding + ';">' + data[i] + '</div></td>';
        }

        var term = '</tr></tbody></table>';
        thisObj.m_tableRowCounter++;

        /////////////////////////////////////////
        // handle paging calculation
        if(thisObj.m_pagingObj != null)
        {
            thisObj.m_pagingObj.m_totalRecs = totalRecs;
            var rowNo = thisObj.m_tableRowCounter;
            var pageNo = thisObj.m_pagingObj.m_curPage;
            var rpp = g_oaConfig.m_oaNumRowPerPage;

            // reach last row of paging
            if(rowNo == (pageNo*rpp) || rowNo == totalRecs &&
                !thisObj.m_pagingObj.m_endPage)
            {
                div.innerHTML = innerHtml + term;
                div.style.width = (width) + 'px';

                if(pageNo > 1 || totalRecs > rowNo)
                {
                    var pageDiv = thisObj.m_pagingObj.createPagingDiv(width);
                    div = this.addPagingDiv(div, pageDiv);
                    thisObj.m_pagingObj.m_numOfRowInPage++;
                }
            }
            // within page
            else if(rowNo > (pageNo-1)*rpp && rowNo < pageNo*rpp)
            {
                innerHtml += term;
                div.innerHTML = innerHtml;
                thisObj.m_pagingObj.m_numOfRowInPage++;
            }
            // outside of paging
            else
                return null;
        }
        // no pagination define
        else
        {
            innerHtml += term;
            div.innerHTML = innerHtml;
        }

        div.style.width = (width) + 'px';

        return div;
    }

    this.addPagingDiv = function(rowDiv, pagingDiv)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.backgroundColor = 'white';
        div.style.paddingTop = '3px';

        var innerHtml = rowDiv.innerHTML + pagingDiv.innerHTML;
        div.innerHTML = innerHtml;

        return div;
    }

    this.f_handlePagingCall = function(pageNo)
    {
        thisObj.m_pagingObj.f_resetValues();
        thisObj.m_pagingObj.m_curPage = pageNo;
        thisObj.prototype.apply(thisObj);
    }

    this.f_adjustDivPosition = function(div, numOfRows)
    {
        var rows = numOfRows == null ? thisObj.m_tableRowCounter : numOfRows;

        if(thisObj.m_pagingObj != null && rows > thisObj.m_pagingObj.m_numOfRowInPage)
            rows = thisObj.m_pagingObj.m_numOfRowInPage;

        thisObj.m_tableRowCounter = rows;

        var adVal = (rows * 31) - 10;
        div.style.top = adVal+'px';
    }

    this.f_createGeneralDiv = function(text)
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible'

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
                      '<div><p>' + text + '</p>' +
                      '</td></tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }

    /**
     * create a div for push buttons.
     * @param buttons - is an array of array contains button name and onclick
     *                  callback.
     *                  [ [btn1, btn1Callback, tooltipString, element id],
     *                  [btn2, btn2Callback, tooltipString, element id],
     *                  []...]
     */
    this.f_createButtons = function(buttons)
    {
        var div = document.createElement('div');
        div.setAttribute('align', 'center');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.height = '40px';

        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="22">';
        for(var i=0; i<buttons.length; i++)
        {
            var btn = buttons[i];
            var elId = btn[3] == undefined ? "" : 'id="' + btn[3] + '" ';
            var cursor = thisObj.f_getCursor(true);

            switch(btn[0])
            {
                case 'AddUser':
                innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_addUser.gif" ' + elId + ' name="addUser" ' +
                    'value="addUser" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Cancel':
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_cancel.gif" ' + elId + ' name="cancel" ' +
                    'value="Cancel" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Restore':
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_restore.gif" ' + elId + ' name="restore" ' +
                    'value="Restore" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Apply':
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_apply.gif" ' + elId + ' name="apply" ' +
                    'value="apply" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Update':
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_update.gif" ' + elId + ' name="update" ' +
                    'value="Update" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                case 'Backup':
                    innerHtml += '<td>' +
                    '<div title="' + btn[2] + '" style="height:30px; ' +
                    'padding-top:15px; ' + cursor + '">' +
                    '<input type="image" src="' + g_lang.m_imageDir +
                    'bt_backup.gif" ' + elId + ' name="backup" ' +
                    'value="Backup" onclick="' + btn[1] +
                    '"></div></td>';
                break;
                default:
                    innerHtml += '<td><div style="height:30px; ' +
                        'padding-top:15px; ' + cursor + '">' +
                        '<input type="button" name="' + btn[0] +
                        '" value="' + btn[0] + '" onclick="' +
                        btn[1] + '" title="' + btn[2] + '" ' +
                        elId + '>' +
                        '</div></td>';
                break;
            }
            innerHtml += '<td><div style="padding-left:20px">&nbsp;</div></td>';
        }

        innerHtml += '</tr></tbody></table>';

        div.innerHTML = innerHtml;

        return div;
    }

    this.f_removeDivChildren = function(div)
    {
        if(div == undefined) return;

        thisObj.m_tableRowCounter = 0;

        while(div.hasChildNodes())
            div.removeChild(div.childNodes[0])
    }

    /**
     * define column field
     * @param colName - column name use to display on the table column
     * @param width - width of column
     * @param type - type of data to be displayed (text, image, checkbox,
     *                text input, combobox)
     * @param paddLeft - number of pixel to be padding left
     * @param sortable - true allow sort column, else false (default)
     */
    this.f_createColumn = function(colName, width, type, paddLeft, sortable)
    {
        if(sortable != undefined && sortable)
            thisObj.m_allowSort = true;

        return [colName, width, type, paddLeft, sortable];
    }

    this.f_createColNameHTML = function(colName, col, isSortable)
    {
        var header = "";
        var cName = isSortable != null && isSortable ? "<u>" + colName + "</u>" : colName;

        if(colName != null && colName.length > 2)
        {
            if(thisObj.m_sortCol == col)
            {
                var sortIcon = thisObj.m_sortOrder == 'asc' ?
                    '<img src="' + g_lang.m_imageDir + 'sortAsc.gif"/>' :
                    '<img src="' + g_lang.m_imageDir + 'sortDesc.gif"/>';

                if(!thisObj.m_allowSort) sortIcon = '';
                header = "<p valign='center' align='center'><b>" +
                      cName + "&nbsp;" + sortIcon + "<br></b></p>";
            }
            else
                header = "<p valign='center' align='center'><b>" +
                      cName + "<br></b></p>";
        }

        return header;
    }

    this.f_renderStatus = function(val)
    {
        switch(val)
        {
            default:
                return '<span title="Status is unknow" align="center">' +
                        '<img src="' + g_lang.m_imageDir + 'statusUnknown.gif"/></span>';
            case 'down':
                return '<span title="Status is down" align="center">' +
                        '<img src="' + g_lang.m_imageDir + 'statusDown.gif"/> </span>';
            case 'up':
                return '<span title="Status is up" align="center">' +
                        '<img src="' + g_lang.m_imageDir + 'statusUp.gif"/> </span>';
        }
    }

    /**
     * @param val - check or un-check the checkbox
     * @param elId - this element id
     * @param cb = callback
     * @param tooltip - tooltip for this checkbox
     */
    this.f_renderCheckbox = function(val, elId, cb, tooltip)
    {
        var checked = val == 'yes' ? 'checked' : '';
        tooltip = tooltip == undefined ? "" : tooltip;

        return '<input id="' + elId + '" type="checkbox" ' + checked +
                ' title="' + tooltip + '" onclick="' + cb + '"/>';
    }

    this.f_renderCombobox = function(options, val)
    {
        var cb = '<select>';

        for(var i=0; i<options.length; i++)
        {
            if(options[i] == val)
                cb += '<option selected value="' + options[i] + '">' + options[i] +
                  '</option>';
            else
                cb += '<option value="' + options[i] + '">' + options[i] +
                  '</option>';
        }

        return cb;
    }

    this.f_renderAnchor = function(text, link, tooltip)
    {
        return '<a title="' + tooltip + '" href="#" onclick="' + link + '">' +
                text + '</a>';
    }

    this.f_renderAnchorHref = function(text, link, tooltip)
    {
        return '<a title="' + tooltip + '" href="' + link + '">' +
                text + '</a>';
    }

    this.f_renderButton = function(text, enable, cb, tooltip)
    {
        var imgSrc = '';
        switch(text)
        {
            case 'Stop':
                imgSrc = enable ? 'bt_stop.gif' : 'bt_stop_disabled.gif';
                break;
            case 'Restart':
                imgSrc = enable ? 'bt_restart.gif' : 'bt_restart_disabled.gif';
                break;
            case 'Start':
                imgSrc = enable ? 'bt_start.gif' : 'bt_start_disabled.gif';
                break;
            case 'deleteUser':
            case 'delete':
                imgSrc = enable ? 'ico_delete.gif' : 'ico_delete_disabled.gif';
                break;
            case 'restore':   // ico image
                imgSrc = 'ico_disquette.gif';
                break;
            case 'download':
                imgSrc = 'ico_download.gif';
                //return '<a title="' + tooltip + '" href=' + cb +
                //        '><img src="' + imgSrc + '"></a>';
                break;
            case 'Cancel':
                imgSrc = 'bt_cancel.gif';
                break;
            case 'Restore':   // button image
                imgSrc = enable ? 'bt_restore.gif' : 'bt_restore_disabled.gif';
                break;
        }

        var disabled = enable ? '' : 'disabled';
        var cursor = thisObj.f_getCursor(enable);

        return '<div style="' + cursor + '"><input type="image" title="' +
                        tooltip + '" name="' +
                        text + '" src="' + g_lang.m_imageDir + imgSrc + '" ' + disabled +
                        ' onclick="' + cb + '"></div>';
    }

    this.f_renderProgressBar = function(val, tooltip)
    {
        var bgColor = 'green';
        if(val >= 80)
            bgColor = 'red';
        else if(val >= 60)
            bgColor = 'orange';

        return '<div title="' + tooltip + '" style="position:relative; ' +
              'width:102px; height:18px;' +
              'border:1px solid #000; background-color:white;" >'+
              '<div style="border:1px solid #fff; left:0px; width:' + val +
              'px; height:16px; background-color:'+ bgColor +
              ';"></div><div style="position:relative; top:-16px; left:40px;">'+
              '<b>' + val +'%</b></div></div>';
    }

    /**
     * handle error message from evt (ft_eventObj) if error is not = 0.
     * @param evt - ft_eventObj
     * @param errTitle - title to be shown on popup dialog.
     * @return true if there is error, else return false (no error)
     */
    this.f_isServerError = function(evt, errTitle)
    {
        if(evt.f_isError())
        {
			if (evt.m_errCode == 3) {
				//handle in timeoutMonitor.js
				//g_utils.f_popupMessage('timeout', 'timeout', null, true);
			}
			else {
				g_utils.f_popupMessage(evt.m_errMsg, 'ok', errTitle, true);
			}
            return true;
        }
        else
            return false;
    }

    /**
     * enable/disable <input> element button image.
     * NOTE: the name of enable/disable image must follow below form:
     *        enable image: exampleImage.gif
     *        disable image: exampleImage_disabled.gif
     *
     * @param elementId - dom element id
     * @param enabled - true is enabled button image, false disabled.
     */
    this.f_enabledDisableButton = function(elementId, enabled)
    {
        var button = document.getElementById(elementId);
        if(button != undefined)
        {
            var src = button.src;
            var in1 = src.lastIndexOf('/');
            var in2 = src.lastIndexOf('_disabled.gif');
            if(in2 < 0)
                in2 = src.lastIndexOf('.gif');
            var name = src.substring(in1, in2);

            var newSrc = src.substr(0, in1);
            button.disabled = !enabled;
            button.src = enabled ? newSrc + name + '.gif' : /*newSrc + name + '.gif';*/
                          newSrc + name + '_disabled.gif';
        }
    }

    this.f_resetPagination = function(totalRecs)
    {
        if(thisObj.m_pagingObj != null)
            thisObj.m_pagingObj.f_resetValues(totalRecs);
    }

    this.f_resetSorting = function()
    {
        thisObj.m_sortOrder = 'asc';
        thisObj.m_sortCol = 0;
    }

    this.f_isSortEnabled = function(colHeader, col)
    {
        // check for header sorting is allow or not
        var chd = colHeader[col];
        if(chd[4] == undefined || chd[4] == false)
            return false;

        var order = thisObj.m_sortOrder;

        if(col != thisObj.m_sortColPrev)
            order = 'asc';
        else if(order == 'asc')
            order = 'desc';
        else
            order = 'asc';

        thisObj.m_sortCol = col;
        thisObj.m_sortOrder = order;

        ///////////////////////////////
        // reset the pagination attributes
        thisObj.f_resetPagination();

        return true;
    }

    this.f_sortArray = function(col, ar)
    {
        var si = col;
        var sar = new Array();

        //////////////////////////////////////////////////////////////////
        // loop through the ar and place the sorting index value at begin
        // of the string
        for(var i=0; i<ar.length; i++)
        {
            var fu = ar[i];
            var a = fu.split('|');
            sar[i] = a[si];

            for(var j=0; j<a.length; j++)
            {
                if(j == si) continue;

                sar[i] += '|' + a[j];
            }
        }

        // perform sorting
        sar.sort();
        if(si > 0)
        {
            ///////////////////////////////////////////
            //
            ar = sar;
            for(var i=0; i<ar.length; i++)
            {
                var fu = ar[i];
                var a = fu.split('|');
                sar[i] = '';

                for(var j=1; j<a.length; j++)
                {
                    sar[i] += (j != 1 ? '|':'') + a[j];

                    if(j == si)
                        sar[i] += '|' + a[0];
                }
            }
        }

        if(thisObj.m_sortOrder == 'desc')
            sar.reverse();

        thisObj.m_sortCol = col;
        thisObj.m_sortColPrev = col;
        return sar;
    }

    /**
     * @param enable : true if <div> is mouse enable for clicking
     */
    this.f_getCursor = function(enable)
    {
        //alert(g_xbObj.f_getBrowserAgent());
        switch(g_xbObj.f_getBrowserAgent())
        {
            case 'ie':
                return enable ? 'cursor:pointer;' : "";
            case 'gecko':
                return enable ? 'cursor:pointer;' : 'cursor:default;';
            default:
            case 'opera':
            case 'kde':
            case 'iemac':
            case 'safari':
                return '';
        }
    }
}

/*
function f_confHandleSessionTimeoutConfirm()
{
	g_busObj.f_userTimeout();
}
*/