/*
 Document   : utm_confIDSExpert.js
 Created on : Mar 02, 2009, 6:18:51 PM
 Author     : Loi.Vo
 Description: URL filtering expert
 */
function UTM_confIDSExpert(name, callback, busLayer)
{
	var thisObjName = 'UTM_confIDSExpert';
	var thisObj = this;
	this.m_div = undefined;
	this.m_id = undefined;

	/**
	 * @param name - name of configuration screens.
	 * @param callback - a container callback
	 * @param busLayer - business object
	 */
	this.constructor = function(name, callback, busLayer)
	{
	}

	this.f_distructor = function()
	{
		this.f_detachEventListener();
	}

    this.f_init = function()
	{

	}

	/*
	 * This should be called from the sub class to initialize the fields.
	 */
	this.f_setConfig = function(config)
	{
	}

	this.f_getConfigurationPage = function()
	{
		var div = document.createElement('div');
		div.setAttribute('id', 'conf_ids_expert');
        div.setAttribute('align', 'left');
		/////////////////////////////////////////
		// set inner styling of the div tag
		//div.style.position = 'absolute';
		div.style.pixelLeft = 0;
		div.style.padding = '10px';
		div.style.backgroundColor = 'white';

		div.innerHTML = this.f_doLayout();
		//alert('form generated html: ' + div.innerHTML);
		div.style.display = 'block';

		document.getElementById('ft_container').appendChild(div);

		this.f_attachEventListener();
		this.f_loadVMData(div);
		this.m_div = div;
		this.f_resize(60);

		return div;
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
		 var h = this.m_div.offsetHeight;
		 if (padding) {
		 	h += padding;
		 }
         document.getElementById('ft_container').style.height = h + 'px';
         this.f_reflow();
		 g_utmMainPanel.f_requestResize();			 
    }

    this.f_setId = function(id) {
		this.m_id = id;
	}

    this.f_doLayout = function()
    {		
        var text = '<p>' + g_lang.m_ids_Subscribe + '<br/><br/>';
		text += '<div title="' + g_lang.m_subscribe + '"><img id="conf_ids_expert_subscribe" src="' + g_lang.m_imageDir 
		        + 'bt_subscribe.gif"></div>';		
				
        var innerHtml = '<table cellspacing="0" cellpadding="0" border="0">';
        innerHtml += '<tbody><tr><td>' +
                      '<div><p>' + text + '</p>' +
                      '</td></tr></tbody></table>';

        return innerHtml;
    }

    this.f_attachEventListener = function()
    {
        var btSubcribe = document.getElementById('conf_ids_expert_subscribe');
        g_xbObj.f_xbAttachEventListener(btSubcribe, 'click', thisObj.f_handleClick, true);
    }

    this.f_detachEventListener = function()
    {
        var btSubcribe = document.getElementById('conf_ids_expert_subscribe');
        g_xbObj.f_xbDetachEventListener(btSubcribe , 'click', thisObj.f_handleClick, true);
    }

    this.f_onUnload = function()
    {
        this.f_detachEventListener();
    }

    this.f_loadVMData = function(element)
    {
    }

    this.f_stopLoadVMData = function()
    {
    }
	
	this.f_subscribe = function()
	{
		alert('subscribe button clicked');
	}
	
    this.f_handleClick = function(e)
    {
        var target = g_xbObj.f_xbGetEventTarget(e);
        if (target != undefined) {
            var id = target.getAttribute('id');
            if (id == 'conf_ids_expert_subscribe') { //subscribe clicked
				thisObj.f_subscribe();
				return false;
			}
        }
    }
}