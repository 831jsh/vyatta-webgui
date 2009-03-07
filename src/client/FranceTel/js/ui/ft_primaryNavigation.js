/*
 Document   : ft_primaryNavigation.js
 Created on : Feb 26, 2009, 3:19:25 PM
 Author     : Loi Vo
 Description: The primary navigation bar in the main frame
 */
function FT_primaryNavigation(){
    /////////////////////////////////////
    // properties
    var thisObj = this;
    this.m_parent = undefined; /* reference to mainframe */
    this.m_vmList = undefined;
    this.m_selectedVm = undefined;
    
    ///////////////////////////////////////
    // functions
    /**
     * A initialization method
     */
    this.f_init = function(p, vmList){

        thisObj.m_vmList = vmList;
        thisObj.m_parent = p;
        
        if (thisObj.m_vmList != undefined) {
            for (i = 0; i < thisObj.m_vmList.length; i++) {
                thisObj.f_addVm(thisObj.m_vmList[i].m_name);
            }
        }
        thisObj.f_selectVm(VYA.FT_CONST.OA_ID);
    }
    
	this.f_getUrlPath = function(vm) {
		if (vm==VYA.FT_CONST.OA_ID) {
			return '#';
		} else if (vm==VYA.FT_CONST.BLB_ID) {
			return 'http://www.orange-business.com/index_en.html';
		} else {
			return 'http://www.vyatta.org';
		}
	}
	
    /*
     * Add this VM to the primary navigation bar
     */
    this.f_addVm = function(vm){
        var p = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
        var newVM = document.createElement('th');
        newVM.setAttribute('id', vm);
        newVM.setAttribute("class", 'VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_CLS');
		newVM.setAttribute("urlPath", thisObj.f_getUrlPath(vm));
        newVM.appendChild(document.createTextNode(vm));		
        newVM.style.width = VYA.DYN_STYLE.PRI_NAV_ITEM_WIDTH;
		newVM.style.height = '40px';
        newVM.style.border = VYA.DYN_STYLE.PRI_NAV_ITEM_BORDER;
		newVM.style.fontWeight = VYA.DYN_STYLE.PRI_NAV_ITEM_FONT_WEIGHT;
		newVM.style.textAlign = VYA.DYN_STYLE.PRI_NAV_ITEM_TEXT_ALIGN;
        newVM.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ITEM_BG_IMG;
        p.appendChild(newVM);
        g_xbObj.f_xbAttachEventListener(newVM, 'click', thisObj.f_handleClick, true);
        g_xbObj.f_xbAttachEventListener(newVM, 'mouseover', thisObj.f_handleMouseover, true);
        g_xbObj.f_xbAttachEventListener(newVM, 'mouseout', thisObj.f_handleMouseout, true);
    }
    
    /*
     * Return the current selected VM
     */
    this.f_getSelectedVm = function(){
        return thisObj.m_selectedVm;
    }
    
    /*
     * Set the selection to this VM
     */
    this.f_selectVm = function(vmId, urlPath){
        thisObj.m_selectedVm = vmId;
        thisObj.f_highlightSelectedVm(thisObj.m_selectedVm);
        thisObj.m_parent.f_showVm(thisObj.m_selectedVm, urlPath);
    }
    
    /*
     * Highlight the currently selected VM in the primary navigation bar
     */
    this.f_highlightSelectedVm = function(vmId){
        var bar = document.getElementById(VYA.FT_CONST.DOM_MAIN_FRM_NAV_BAR_ID);
        for (var i = 0; bar.childNodes[i]; i++) {
            id = f_elemGetAttribute(bar.childNodes[i], 'id');
            if ((id != undefined) && (id != null)) {				
                if (vmId != id) {
                    bar.childNodes[i].style.color = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_COLOR;
                    bar.childNodes[i].style.borderBottom = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_BOTTOM;					
                    bar.childNodes[i].style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BG_IMG;
                } else {
                    bar.childNodes[i].style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
                    bar.childNodes[i].style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
                    bar.childNodes[i].style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
                    bar.childNodes[i].style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
                }
            }
        }		
    }
    
    /*
     * Mouseover handler for the primary navigation bar items.
     */
    this.f_handleMouseover = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        target.style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
        target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
        target.style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
        target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
    }
    
    /*
     * Mouseout handler for the primary navigation bar items.
     */
    this.f_handleMouseout = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        var vmId = target.innerHTML.trim();
        if (vmId != thisObj.m_selectedVm) {
            target.style.color = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_COLOR;
            target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BORDER_BOTTOM;
            target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_NOT_ACT_ITEM_BG_IMG;
        } else {
            target.style.color = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_COLOR;
            target.style.borderBottom = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BORDER_BOTTOM;
            target.style.background = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG;
            target.style.backgroundImage = VYA.DYN_STYLE.PRI_NAV_ACT_ITEM_BG_IMG;
        }
    }
    
    /*
     * Mouseclick handler for the primary navigation bar item
     */
    this.f_handleClick = function(e){
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            //Get the id of the tab being clicked.
            var vmId = target.innerHTML.trim();
            if (vmId == thisObj.m_selectedVm) {
                return false;
            }
			var urlPath = target.getAttribute('urlPath');
            thisObj.f_selectVm(vmId, urlPath);
        }
    }
}
