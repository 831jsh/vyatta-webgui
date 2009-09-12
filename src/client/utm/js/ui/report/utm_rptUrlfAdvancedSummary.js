/**
 * @author loi
 */
/*
 Document   : utm_rptUrlfAdvancedSummary.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: summary web filtering log 
 */
function UTM_rptUrlfAdvancedSummary(name, busLayer)
{
    var thisObjName = 'UTM_rptUrlfAdvancedSummary';
    this.m_id = 'rpt_urlf_advanced_summary';
    this.m_div = undefined;
    this.m_busLayer = undefined;
    this.m_name = undefined;
    var thisObj = this;
    
    
    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, busLayer)
    {
        this.privateConstructor(name, busLayer);
    }
    
    this.privateConstructor = function(name, busLayer)
    {
        this.m_busLayer = busLayer;
        this.m_name = name;
    }
    this.privateConstructor(name, busLayer);
    
    this.f_distructor = function() { }
    
	this.f_refresh = function() { }
	
	this.f_show = function()
	{
		var el = document.getElementById(thisObj.m_id);
		if (el != null) {
			el.style.display = '';
		}
	}
	
	this.f_hide = function()
	{
		var el = document.getElementById(thisObj.m_id);
		if (el != null) {
			el.style.display = 'none';
		}		
	}
	
	this.f_getPage = function()
	{
        var div = document.createElement('div');
        div.setAttribute('align', 'left');
        div.setAttribute('id', thisObj.m_id);
		
        /////////////////////////////////////////
        // set inner styling of the div tag
        div.style.backgroundColor = 'white';
		div.style.paddingTop = '15px';
		div.style.paddingLeft = '30px';
        div.style.display = 'none';
        div.style.height = 'auto';
		//div.style.border= '1px solid blue';
		
		var html = "<h3>Show web filtering advanced log table</h3>" +				   
                "<br/><br/><p>&nbsp;&nbsp;&nbsp;" +
                "This space is reserved for web filtering advanced log table." +
                "<br/>&nbsp;&nbsp;&nbsp;" +
                "For now this is just dummy text." +
                "</p>";
	    div.innerHTML = html;
		
		thisObj.m_div = div;
		return thisObj.m_div;		
	}	

	
}
