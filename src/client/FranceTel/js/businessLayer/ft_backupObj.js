/*
    Document   : ft_vmBackupObj.js
    Created on : Feb 26, 2009, 3:19:25 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_backupEntryRec(vmId)
{
    var thisObj = this;
    this.m_vmId = vmId;
    this.m_vmName = null;
    this.m_type = [];

    this.f_setVmName = function(vmId)
    {
        var vmRec = g_busObj.f_getVmRecByVmId(vmId);
        thisObj.m_vmName = vmRec.m_displayName;
    }

    this.f_addType = function(type)
    {
        if(thisObj.m_type == undefined)
            thisObj.m_type = [];

        thisObj.m_type[thisObj.m_type.length] = type;
    }
}

function FT_backupContentRec()
{
    var thisObj = this;
    thisObj.m_entry = [];

    this.f_addEntry = function(vmId, type)
    {
        var entry = thisObj.f_getVMEntryRec(vmId);

        if(entry != null)
        {
            entry.f_addType(type);
        }
        else
        {
            entry = new FT_backupEntryRec(vmId);
            entry.f_addType(type);
            entry.f_setVmName(vmId);
            thisObj.m_entry[thisObj.m_entry.length] = entry;
        }
    }

    this.f_getVMEntryRec = function(vmId)
    {
        for(var i=0; i<thisObj.m_entry.length; i++)
        {
            var e = thisObj.m_entry[i];

            if(e.m_vmId == vmId)
                return e;
        }

        return null;
    }
}

function FT_backupRec(bkDate, name, file, content)
{
    this.m_bkDate = bkDate;
    this.m_bkBy = 'admin';    // owner
    this.m_name = name;
    this.m_file = file;
    //this.m_limit = false;       // limit of backup allow for each role
    this.m_content = content;   // data type : FT_backupContentRec

    // below is the sample response string from server for the get restore list:
    // we conver this string into FT_backupContentRec object.
    /*
     *  <archive>
	<name>name</name>
	<file>260309_11h51PM_1</file>
	<date>260309 11h51PM</date>
	<contents>
		<entry>
			<vm>mike</vm><type>conf</type>
		</entry>
		<entry>
			<vm>kevin_check_your_email</vm><type>conf</type>
		</entry>
		<entry>
			<vm>mike</vm><type>data</type>
		</entry>
		<entry>
			<vm>kevin_check_your_email</vm><type>data</type>
		</entry>
          </contents>
        </archive>
     */

}

function FT_backupObj(busObj)
{
    /////////////////////////////////////
    // properteis
    var thisObj = this;
    this.m_objName = 'FT_vmBackupObj';
    this.m_guiCb = null;
    this.m_busObj = busObj;
    this.m_archiveRec = null;
    this.m_downloadFile = null;
    this.m_limit = true;

    /////////////////////////////////////////
    /**
     * A callback function for all user management requests.
     */
    this.f_respondRequestCallback = function(resp, cmdSent, noUICallback)
    {
        var response = thisObj.m_busObj.f_getRequestResponse(
                        thisObj.m_busObj.m_request);

        if(response == null) return;

        if(response.f_isError != null)
        {
            if(noUICallback == undefined || !noUICallback)
                thisObj.m_guiCb(response);
        }
        else
        {
            var evt = new FT_eventObj(0, thisObj, '');

            if(thisObj.m_lastCmdSent == undefined)
                thisObj.m_lastCmdSent = cmdSent;

            var err = response.getElementsByTagName('error');
            if(err != null && err[0] != null)
            {
                if(thisObj.m_lastCmdSent.indexOf('archive list') > 0)
                {
                    thisObj.m_archiveRec = thisObj.f_parseRestoreData(err);
                    evt = new FT_eventObj(0, thisObj.m_archiveRec, '');
                }
                else if(thisObj.m_lastCmdSent.indexOf('archive get') > 0)
                {
                    window.location = thisObj.m_downloadFile;
                }
                else if(thisObj.m_lastCmdSent.indexOf('archive restore status') > 0)
                {

                }
                else if(thisObj.m_lastCmdSent.indexOf('archive delete') > 0)
                {
                }
            }

            if(thisObj.m_guiCb != undefined)
                thisObj.m_guiCb(evt);
        }
    };

    this.f_parseRestoreData = function(response)
    {
        var reNodes = thisObj.f_getRestoreNodesFromResponse(response);
        if(reNodes != null)
        {
            thisObj.m_limit = true;
            var arch = [];
            var c=0;
            for(var i=0; i<reNodes.length; i++)
            {
                var val = reNodes[i];
                if(val.nodeName == 'archive')
                {
                    arch[c] = new FT_backupRec();

                    for(var j=0; j<val.childNodes.length; j++)
                    {
                        var cNode = val.childNodes[j];
                        if(cNode == undefined) continue;

                        if(cNode.firstChild != undefined)
                        {
                            switch(cNode.nodeName)
                            {
                                case 'name':
                                  arch[c].m_name = cNode.firstChild.nodeValue;
                                break;
                                case 'file':
                                  arch[c].m_file = cNode.firstChild.nodeValue;
                                break;
                                case 'date':
                                  arch[c].m_bkDate = cNode.firstChild.nodeValue;
                                break;
                                case 'owner':
                                  arch[c].m_bkBy = cNode.firstChild.nodeValue;
                                break;
                                //case 'limit':
                                //  arch[c].m_limit = cNode.firstChild.nodeValue;
                                //break;
                                case 'contents':
                                  arch[c].m_content = thisObj.f_parseContent(cNode);
                            }
                        }
                    }
                    c++;
                }
                else if(val.nodeName == 'limit' && val.firstChild != undefined)
                {
					if (val.firstChild.nodeValue == 'true') {
						thisObj.m_limit = true;
					} else if (val.firstChild.nodeValue == 'false') {
						thisObj.m_limit = false;
					}
                }
            }
        }

        return arch;
    };

    this.f_parseContent = function(node)
    {
        var content = null;
        if(node == undefined || node.childNodes == undefined) return content;

        content = new FT_backupContentRec();
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].nodeName == 'entry')
            {
                var cNode = node.childNodes[i];
                var vm ="";
                var type = "";

                for(var j=0; j<cNode.childNodes.length; j++)
                {
                    var ccNode = cNode.childNodes[j];

                    if(ccNode.nodeName == 'vm')
                        vm = ccNode.firstChild.nodeValue;
                    else if(ccNode.nodeName == 'type')
                        type = ccNode.firstChild.nodeValue;
                }

                content.f_addEntry(vm, type);
            }
        }

        return content;
    };

    this.f_getRestoreNodesFromResponse = function(response)
    {
        var cn = response[0].childNodes;
        for(var i=0; i<cn.length; i++)
        {
            if(cn[i].nodeName == 'msg')
            {
                var vm = cn[i].childNodes;
                for(var j=0; j<vm.length; j++)
                {
                    if(vm != undefined && vm[j] != undefined &&
                        vm[j].nodeName == 'archive')
                        return vm;
                }
            }
        }

        return null;
    };

    this.f_convertMode = function(mode)
    {
        switch(mode)
        {
            case 0: return 'config';
            case 1: return 'data';
            default:
            case 2: return 'both';
        }
    };

    this.f_deleteArchiveFile = function(arName, arFile, cb)
    {
        thisObj.m_guiCb = cb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                    "<statement>open-app archive delete '" + arFile +
                    "'</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    };

    this.f_loadArchiveFile = function(arFile, cb, type)
    {
        thisObj.m_guiCb = cb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                    "<statement>open-app archive " + type + " '" + arFile +
                    "'</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);

        if(type == 'get')
            thisObj.m_downloadFile = '../archive/' + sid + '/' + arFile + '.tar';
    };

    /**
     *  send backup/restore command to server to perform vm backup/resstore.
     *  @param vms - a list of vm to be backup or restore. vms is array type
     *  @param modes - list of back modes. ex. ['config', 'data', 'data'....] array type
     *                this list shoudl sync with vms.
     *  @param type - a string of 'backup' or 'restore'
     *  @param guiCb - gui callback function
     *  @param archName - backup archieve filename
     */
    this.f_backupRestore = function(vms, modes, type, guiCb, archName)
    {
        if(vms == undefined || vms.length == 0)
        {
            var evt = new FT_eventObj(9, '', 'Invalid vm');
            guiCb(evt);
            return;
        }

        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var commas = "";
        var aName = archName == undefined ? "" : " '" + archName + "' target ";
        var xmlstr = "<command><id>" + sid + "</id>" +
                    "<statement>open-app archive " + type + aName + ' ';

        for(var i=0; i<vms.length; i++)
        {
            if (i == 0) {
                    xmlstr += "'";
            } else {
                    commas = ",";
            }
            xmlstr += commas + vms[i] + ":" + modes[i];
        }

        xmlstr += "'</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    };

    /**
     *  retrieve list of restore vm from server
     */
    this.f_getVMRestoreList = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
        var sid = g_utils.f_getUserLoginedID();
        var xmlstr = "<command><id>" + sid + "</id>" +
                     "<statement>open-app archive list</statement></command>";
        this.m_lastCmdSent = thisObj.m_busObj.f_sendRequest(xmlstr,
                              thisObj.f_respondRequestCallback);
    };

    /**
     *  retrieve list of restore vm from server
     */
    this.f_getVMBackupList = function(guiCb)
    {
        thisObj.m_guiCb = guiCb;
    };
}