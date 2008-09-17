/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

MyLabel = Ext.extend(Ext.form.Label,
{
    setText: function(t)
    {
        this.text = t;
        if(this.rendered)
            this.el.update(t);
    }
});



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Vyatta cookie provider. the cookie stays in the system for 30 days.
m_cookieP = undefined;
function f_getCookieProvider()
{
    if(m_cookieP == undefined)
    {
      m_cookieP = new Ext.state.CookieProvider(
      {
        expires: new Date(new Date().getTime() + (5 * 60 * 60 * 1000))
        //secure: true
      });

      Ext.state.Manager.setProvider(m_cookieP);
    }

    return m_cookieP;
}

/*******************************************************************************
 * return a new login timer counter
 *******************************************************************************/
function f_resetLoginTimer()
{
    var timer = new Date(new Date().getTime() + (35 * 60 * 1000));
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_LOGIN_TIMER, timer);

    return timer;
}
////////////////////////////////////////////////////////////////////////////////
// return true if user is still login, else reture false;
// updateLoginTimer - true - will update the login timer
//                    false - will not update login timer
// promptMsg - true - will prompt login timeout message.
//             false - will not prompt login timeout message
function f_isUserLogined(updateLoginTimer, promptMsg)
{
    var cookie = f_getCookieProvider();
    var loginTimer = cookie.get(V_COOKIES_LOGIN_TIMER, V_NOT_FOUND);

    var curTime = new Date().getTime();
    if(loginTimer == V_NOT_FOUND || loginTimer < curTime)
    {
        if(promptMsg != undefined && promptMsg)
          f_promptUserNotLoginMessage(null);

        return false;
    }
    else
    {
        if(updateLoginTimer != undefined && updateLoginTimer)
            f_resetLoginTimer();

        return true;
    }
}

function f_isUserLogin(promptMsg, updateTimer)
{
    if(updateTimer != undefined)
        return f_isUserLogined(updateTimer, promptMsg);

    return f_isUserLogined(true, promptMsg);
}

function f_saveUserLoginName(name)
{
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_USER_NAME, name);
}

function f_getUserLoginName()
{
    var cookie = f_getCookieProvider();
    return cookie.get(V_COOKIES_USER_NAME, V_NOT_FOUND);
}

function f_saveUserLoginId(id)
{
    var cookie = f_getCookieProvider();
    cookie.set(V_COOKIES_USER_ID, id);
}

function f_getUserLoginedID(cookieP /* cookieP is optional */)
{
    if(cookieP == undefined)
        return f_getCookieProvider().get(V_COOKIES_USER_ID, V_NOT_FOUND);

    return cookieP.get(V_COOKIES_USER_ID, V_NOT_FOUND);
}

function f_userLogout(isRedirectToHomePage)
{
    var cookieP = f_getCookieProvider();

    cookieP.set(V_COOKIES_LOGIN_TIMER, V_NOT_FOUND);

    if(isRedirectToHomePage != undefined && isRedirectToHomePage)
        f_redirectToHomePage();
}

/***************************************************************************
 * login hander for button action and server callback
 **************************************************************************/
function f_loginHandler(urlLocation, urlPost, uField, pField)
{
      var userField = uField;
      var pwField = pField;

      //m_statusBar.showBusy();
      var f_authCb = function(options, success, response)
      {
        var xmlRoot = response.responseXML.documentElement;
        var q = Ext.DomQuery;
        var id = q.selectValue(V_COOKIES_USER_ID, xmlRoot, V_NOT_FOUND);

        f_saveUserLoginId(id);
        f_saveUserLoginName(userField.getValue());

        if(id == V_NOT_FOUND)
        {
          f_promptErrorMessage('Login Failed',
              'Invalid User Name and/or Password. Please try again.');
        }
        else
        {
          f_resetLoginTimer();
          window.location = urlLocation;
        }
      }

      var xmlstr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                   + '<vyatta><auth><user>'
                   + userField.getValue()
                   + "</user>\n"
                   + '<pswd>'
                   + pwField.getValue()
                   + "</pswd></auth></vyatta>\n";

      var conn = new Ext.data.Connection({});
      conn.request(
      {
        url: urlPost,       //'/cgi-bin/webgui-wrap',
        method: 'POST',
        xmlData: xmlstr,
        callback: f_authCb
      });
}

var f_isLoginFieldsDirty = function(uField, pField)
{
    if(uField.isDirty() && pField.isDirty())
        return true;
}

var f_LoginKeyPressHandler = function(field, e, urlLocation, urlPost,
                              userField, pwField, lButton)
{
    //////////////////////////////////////////////////
    // check for ENTER key to trigger the 'login'
    // button
    if(e.getKey() == 13 && f_isLoginFieldsDirty(userField, pwField))
        f_loginHandler(urlLocation, urlPost, userField, pwField);

    ////////////////////////////////////////
    // enable the 'login' button if both
    // user and password field are dirty.
    f_isLoginFieldsDirty(userField, pwField) ? lButton.enable() :
                         lButton.disable();
}

var f_clearEditor = function(editor)
{
    if(editor == undefined) return;

    editor.opVal = undefined;

    if(editor.items != undefined)
    {
        while(editor.items.getCount() > 0)
            editor.remove(editor.items.itemAt(0));
    }
}

////////////////////////////////////////////////////////////////////////////////
// Help session related....
function f_createHelpTipsButton(callback)
{
    var help = f_getHelpTipsState();

    var helpButton = new Ext.Button(
    {
      handler: callback
    });

    if(help == V_HELP_ON)
        helpButton.setText('Show Tips');
      else
        helpButton.setText('Hide Tips');

    return helpButton;
}

function f_createLoginUserNameField()
{
    var userField = new Ext.form.TextField(
    {
      id: 'id_userField'
      ,fieldLabel: 'User name:'
      ,labelAlign: 'left'
      ,name: 'userName'
      ,labelSeparator: ''
      ,width: 180
      ,inputType: 'text'
      ,enableKeyEvents: true
      ,allowBlank:false
      ,blankText: 'Please enter User Name'
      //,tabIndex: 0
    });

    return userField;
}

function f_createLoginPasswordField()
{
    passField = new Ext.form.TextField(
    {
      fieldLabel: 'Password:'
      ,labelAlign: 'left'
      ,name: 'password'
      ,labelSeparator: ''
      ,width: 180
      ,inputType: 'password'
      ,enableKeyEvents: true
      ,allowBlank:false
      ,blankText: 'Please enter Password'
    });

    return passField;
}


function f_toggleHelpTips(helpButton)
{
    var cookiesP = f_getCookieProvider();

    var help = f_getHelpTipsState();
    if(help == V_HELP_ON)
        cookiesP.set(V_COOKIES_HELP_TIP_STATE, V_HELP_OFF);
    else
        cookiesP.set(V_COOKIES_HELP_TIP_STATE, V_HELP_ON);

    if(helpButton != undefined)
    {
        if(help == V_HELP_ON)
          helpButton.setText('Hide Tips');
        else
          helpButton.setText('Show Tips');
    }
}

function f_getHelpTipsState()
{
    var cookiesP = f_getCookieProvider();
    var help = cookiesP.get(V_COOKIES_HELP_TIP_STATE, V_NOT_FOUND);

    return (help == V_NOT_FOUND) ? V_HELP_ON : help;
}

function f_ForceUserLoginIfNotLogin()
{
    //////////////////////////////////////////////////////////
    // if user is not login, f_redirectToHomePage() will be
    // called.
    if(!f_isUserLogined(true, true))
      f_redirectToHomePage();
    else
      f_resetLoginTimer();
}

function f_redirectToHomePage()
{
    window.location = 'ft_main.html';
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// clock ticking every second
var m_clock = new Ext.Toolbar.TextItem('new Date()');
function f_clockTicking()
{
    //Ext.fly(clock.getEl().parentNode).addClass('x-status-text-panel').createChild({cls:'spacer'});

    // Kick off the clock timer that updates the clock el every second:
    Ext.TaskMgr.start(
    {
        run: function()
        {
            Ext.fly(m_clock.getEl()).update(new Date().format('g:i:s A'));
        }
        ,interval: 1000
    });

}
f_clockTicking();

////////////////////////////////////////////////////////////////////////////////
//
function f_onResize(parentPanel, childPanel, adjW, adjH)
{
    if(parentPanel != undefined && childPanel != undefined)
    {
        childPanel.setHeight(parentPanel.getInnerHeight()+adjH);
        childPanel.setWidth(parentPanel.getInnerWidth()+adjW);
    }
}

////////////////////////////////////////////////////////////////////////////////
//

////////////////////////////////////////////////////////////////////////////////
//
function f_createToolTip(targetId, htmlText)
{
    var styleStr =
        "{ width: 100px; text-align:center; padding: 5px 0; border:1px dotted #99bbe8;" +
        " background:#dfe8f6; color: #15428b; cursor:default; margin:10px; " +
        "font:bold 11px tahoma,arial,sans-serif; float:left; }";

    var tt = new Ext.ToolTip(
    {
        target: targetId
        ,html: htmlText
        ,style: styleStr
    })

    return tt;
}

////////////////////////////////////////////////////////////////////////////////
// Error Message Box
function f_promptErrorMessage(title, msgText)
{
    Ext.Msg.show(
    {
      title: title
      ,msg: msgText
      ,buttons: Ext.Msg.OK
      ,icon: Ext.MessageBox.ERROR
    });
}

////////////////////////////////////////////////////////////////////////////////
//
function f_promptUserNotLoginMessage(callbackFn)
{
    alert('Session Time Out \n\n' +
        'For security reasons, your session is no longer active.' +
        '\nPlease re-login again.');
}


////////////////////////////////////////////////////////////////////////////////
// info Message Box
function f_promptInfoMessage(title, msgText, callbackFn)
{
  if(callbackFn == undefined)
  {
    Ext.Msg.show(
    {
      title: title
      ,msg: msgText
      ,buttons: Ext.Msg.OK
      ,icon: Ext.MessageBox.INFO
      ,modal: true
    });
  }
  else
  {
    Ext.Msg.show(
    {
      title: title
      ,msg: msgText
      ,buttons: Ext.Msg.OK
      ,icon: Ext.MessageBox.INFO
      ,modal: true
      //,fn: function() { callbackFn }
    });
  }
}

function f_yesNoMessageBox(title, msgText, callback)
{
    Ext.MessageBox.show(
    {
        title: title
        ,msg: msgText
        ,buttons: Ext.MessageBox.YESNO
        ,fn: callback
        ,icon: Ext.MessageBox.QUESTION
    });
}

function f_hideSendWaitMessage()
{
    if(g_sendCommandWait != null)
        g_sendCommandWait.hide();
}

function f_parseResponseError(xmlRoot)
{
    var success = false;
    var errmsg = '';
    var q = Ext.DomQuery;
    var err = q.selectNode('error', xmlRoot);

    if(err == undefined)
    {
        success = true;
    }
    else
    {
        var code = q.selectValue('code', err, 'UNKNOWN');

        if(code == 'UNKNOWN')
        {
            success = false;
            errmsg = "Unknown";
        }
        else if(code != 0)
        {
            success = false;
            var msg = q.selectValue('msg', err, 'UNKNOWN');

            if(msg != 'UNKNOWN')
                errmsg = msg;
        }
    }

    return [ success, errmsg ];
}

function f_findPercentage(total, free)
{
    if(free <= 0) return 100;

    return 100 - Math.round((free/total) * 100);
}

function f_replace(str, expOld, expNew)
{
    while(str.search(expOld) > -1)
        str = str.replace(expOld, expNew);

    return str;
}