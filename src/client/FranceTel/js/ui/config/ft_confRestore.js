/*
    Document   : ft_confRestore.js
    Created on : Mar 12, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confRestore(name, callback, busLayer)
{
    this.thisObjName = 'FT_confRestore';
    var thisObj = this;
    this.m_dataObj = null;
    this.m_colHd = null;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confRestore.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        var page = this.f_getNewPanelDiv(this.f_init());

        return page;
    }

    this.f_createColumns = function()
    {
        thisObj = this;
        var cols = [];
        var offset = 0;

        cols[0] = this.f_createColumn(g_lang.m_uhHdDate, 120, 'text', '6', true);
        cols[1] = this.f_createColumn(g_lang.m_restoreHdContent, 330, 'text', '6', true);
        
        if(this.f_isInstaller())
        {
            cols[2] = this.f_createColumn(g_lang.m_uhHdWho, 90, 'text', '6', false);
            offset = 1;
        }

        cols[2+offset] = this.f_createColumn(g_lang.m_restoreHdRestore, 80, 'button', '30');
        cols[3+offset] = this.f_createColumn(g_lang.m_restoreHdDownload, 80, 'button', '30');
        cols[4+offset] = this.f_createColumn(g_lang.m_delete, 80, 'button', '30');

        return cols;
    }

    this.f_loadVMData = function()
    {
        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
                    return;

                var bkRec = evt.m_value;
                if(bkRec == undefined)
                {
                    thisObj.f_resetScreen();
                    return;
                }

                thisObj.m_dataObj = bkRec;
                thisObj.f_populateTable();
            }
            thisObj.f_resize();
        }

        g_utils.f_cursorWait();
        thisObj.m_busLayer.f_getVMRestoreListFromServer(cb);
    }

    this.f_populateTable = function()
    {
        if(thisObj.m_div != undefined)
            thisObj.f_resetScreen();

        var sortCol = FT_confDashboard.superclass.m_sortCol;
        var rRec = thisObj.f_createSortingArray(sortCol, thisObj.m_dataObj);

        // create table row
        var vmData = [];
        for(var i=0; i<rRec.length; i++)
        {
            var r = rRec[i].split('|');

            var content = r[1];
            var restDesc = "f_handleRestoreDesc('" + r[3] + "')";
            var anchor = thisObj.f_renderAnchor(content, restDesc,
                        g_lang.m_restoreClickRestore + " (" + content + ")");
            var restore = thisObj.f_renderButton(
                        'restore', true, restDesc, g_lang.m_restoreArchive +
                        ' (' + content + ')');
            var download = thisObj.f_renderButton(
                        'download', true, "f_handleDownloadRestore('" + r[3]+"')",
                        g_lang.m_restoreDownload + ' (' + content + ')');

            var del = thisObj.f_renderButton('delete',
                    thisObj.f_okToDisplayDeleteButton(r)?true:false,
                    "f_deleteRestoreFile('" + content +
                    "', '" + r[3] + "')",
                    g_lang.m_restoreDel + ' (' + content + ')');

            if(thisObj.f_isInstaller())
                vmData = [r[0], anchor, r[2], restore, download, del];
            else
                vmData = [r[0], anchor, restore, download, del];

            var bodyDiv = thisObj.f_createGridRow(thisObj.m_colHd, vmData, rRec.length);
            if(bodyDiv != null)
                thisObj.m_body.appendChild(bodyDiv);
        }

        thisObj.f_adjustDivPosition(thisObj.m_restorePC);
    }

    this.f_okToDisplayDeleteButton = function(r)
    {
        var userRec = g_busObj.f_getLoginUserObj();
        var role = userRec.m_loginUser.m_role;

        if(role == userRec.V_ROLE_ADMIN && r[2] == 'admin')
            return true;
        else if(role == userRec.V_ROLE_INSTALL)
            return true;
        else
            return false;
    }

    this.f_isInstaller = function()
    {
        var userRec = g_busObj.f_getLoginUserObj();
        return userRec.m_loginUser.m_role == userRec.V_ROLE_INSTALL ? true:false;
    }

    this.f_createSortingArray = function(sortIndex, vm)
    {
        var ar = new Array();

        for(var i=0; i<vm.length; i++)
        {
            var content = thisObj.f_getContents(vm[i].m_content.m_entry);

            // NOTE: the order of this partition same as the order
            // grid columns.
            // compose a default table row
            ar[i] = vm[i].m_bkDate + '|' + content + '|' +
                    vm[i].m_bkBy + '|' + vm[i].m_file;
        }

        return thisObj.f_sortArray(sortIndex, ar);
    }

    this.f_handleGridSort = function(col)
    {
        if(thisObj.f_isSortEnabled(thisObj.m_colHd, col))
            thisObj.f_populateTable();
    }

    this.f_stopLoadVMData = function()
    {
    }

    this.f_resetScreen = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.f_removeDivChildren(thisObj.m_header);
        thisObj.m_header = thisObj.f_createGridHeader(thisObj.m_colHd,
                            'f_restoreGridHeaderOnclick');
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_restorePC);
    }

    ////////////////////////////////////////////////////////
    // convert the contents object data into content format where..
    // contents - FT_backupEntryRec object
    // content - string of "vm (type, type), vm (type, type)";
    //
    // ex: [ [utm, config], [pbx, config], [utm, data]...]
    //      "utm (config+data), pbx (config)..."
    this.f_getContents = function(contents)
    {
        var content = '';
        var comma = '';
        for(var i=0; i<contents.length; i++)
        {
            var entry = contents[i];

            if(entry.m_type.length == 2)
            {
                content += comma + entry.m_vmName + " (" + entry.m_type[0] + "+" +
                        entry.m_type[1] + ")";
            }
            else if(entry.m_type.length == 1)
            {
                content += comma + entry.m_vmName + " (" + entry.m_type[0] + ")";
            }

            comma = ", ";
        }

        return content;
    }

    this.f_init = function()
    {
        this.m_colHd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(this.m_colHd,
                                    'f_restoreGridHeaderOnclick');
        this.m_body = this.f_createGridView(this.m_colHd, true);
        this.m_restorePC = this.f_createRestoreFromPC();
        this.f_loadVMData();
        thisObj.f_resetSorting();

        /////////////////////////////////////////////////////////
        // create a callback for paging. when user click on the
        // page number, this function will be called.
        FT_confVMUpdates.superclass.prototype = this.f_populateTable;

        return [this.m_header, this.m_body, this.m_restorePC];
    }

    this.f_launchRestoreDescription = function(fn)
    {
        if(thisObj.m_dataObj == null) return;

        for(var i=0; i<thisObj.m_dataObj.length; i++)
        {
            var bkRec = thisObj.m_dataObj[i];

            if(bkRec.m_file == fn)
            {
                g_configPanelObj.f_showPage(
                VYA.FT_CONST.DOM_3_NAV_SUB_RESTORE_DESC_ID, bkRec);
                return;
            }
        }
    }

    this.f_createRestoreFromPC = function()
    {
        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.display = 'block';
        div.style.backgroundColor = 'white';
        div.style.overflow = 'visible';

        var innerHtml = '<form method="post" enctype="multipart/form-data" ' +
                      'action="/cgi-bin/openapp-uploader.pl" target="uploadFrame">' +
                      '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr height="40">';

        innerHtml += '<td width="200" colspan="2" valign="bottom">' +
                      '<div style="height:20px; padding-left:3px; ' +
                      'padding-top:3px;"><b>' + g_lang.m_restoreRestorePC + '</b></div></td></tr>';

        innerHtml += '<tr height="30"><td><div>' +
                    '<input id="ft_mypcFile" name="mypcfile" type="file" ' +
                    'onsubmit=f_checkUpload()></div></td>'+
                    '<td><div title="Browse my pc" style="padding-left:20px">' +
                    '<input type="button" name="OpenAppl" ' +
                    'style="cursor:pointer;" ' +
                    'value="Go" title="' + g_lang.m_restoreFromMyPCTip + '" onclick="' +
                     'f_handleBrownMyPC()"></div></td>';

        innerHtml += '</tr></tbody></table></form>';

        div.innerHTML = innerHtml;
        return div;
    }

    this.f_sendRestoreFromPC = function(fn)
    {
        var cb = function()
        {
            g_utils.f_cursorDefault();
            g_utils.f_popupMessage(g_lang.m_resUploadCompleted,
                'ok', g_lang.m_restoreUploadTitle, true, null, null);
        }

        fn = fn.substring(0, fn.length-4);
        g_busObj.f_uploadArchiveFileFromServer(fn, fn, cb);
    }

    this.f_restoreFromPC = function()
    {
        var id = document.getElementById('ft_mypcFile');
        var fn = id.value;

        if(fn.indexOf('.tar') == -1)
        {
            g_utils.f_popupMessage(g_lang.m_resoteUploadErrFileType,
                'error', g_lang.m_restoreUploadTitle, true, null, null);
            return;
        }

        var iform = document.forms;
        iform[0].submit();

        var fnc = function()
        {
            thisObj.f_sendRestoreFromPC(fn);
        }
        g_utils.f_cursorWait();
        window.setTimeout(function(){fnc();}, 10000);
        
    }
}
FT_extend(FT_confRestore, FT_confBaseObj);

function f_handleBrownMyPC()
{
    g_configPanelObj.m_activeObj.f_restoreFromPC();
}

function f_handleRestoreDesc(filename)
{
    g_configPanelObj.m_activeObj.f_launchRestoreDescription(filename);
}

function f_handleDeleteRestoreFile(e, filename)
{
    var cb = function(evt)
    {
        g_utils.f_cursorDefault();
        if(g_configPanelObj.m_activeObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
            return;

        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        g_utils.f_cursorWait();
        g_busObj.f_deleteArchiveFileFromServer(filename, filename, cb);
    }
}

function f_handleDownloadRestoreFile(e, filename)
{
    var cb = function(evt)
    {
        g_utils.f_cursorDefault();

        if(g_configPanelObj.m_activeObj.f_isServerError(evt, g_lang.m_restoreErrorTitle))
            return;

        g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
    {
        g_utils.f_cursorWait();
        g_busObj.f_downloadArchiveFileFromServer(filename, filename, cb);
    }
}

function f_handleDownloadRestore(filename)
{
    g_utils.f_popupMessage(g_lang.m_restoreDlConfirm + ' (' + filename + ')?',
                'confirm', g_lang.m_restoreDownload, true,
                "f_handleDownloadRestoreFile(this, '"+ filename + "')");
}

function f_deleteRestoreFile(content, filename)
{
    g_utils.f_popupMessage(g_lang.m_deleteConfirm + ' (' + content + ')?',
                'confirm', g_lang.m_restoreDelTitle, true,
                "f_handleDeleteRestoreFile(this, '"+ filename + "')");
}

function f_restoreGridHeaderOnclick(col)
{
    g_configPanelObj.m_activeObj.f_handleGridSort(col);
}
