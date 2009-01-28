/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var g_cookie =
{
    m_userNameExpire: (60*60*1000),
    m_helpExpire: (5 * 60 * 60 * 1000),

    /**
     * pName - the naem for the cookie to be set
     * p_vallue - the vallue for the cookie to be set
     * p_expires - the time before the cookies to be set expires (in milliseconds)
     * @return - return whether the cookies was set or not
     */
    f_set: function(pName, pValue, pExpires)
    {
        var expires = V_NOT_FOUND;

        if(pExpires != undefined)
        {
            ///////////////////////////////
            // get a base time for expiration date
            var expDate = new Date(new Date().getTime() + pExpires);

            expires = '; expires=' + expDate.toGMTString();
        }

        return (document.cookie = escape(pName) + '=' + escape(pValue || '') +
                expires);
    },

    f_get: function(pName)
    {
        ////////////////////////////////////////
        // get the matching cookie
        var cookie = document.cookie.match(new RegExp('(^|;)\\s*' +
                      escape(pName) + '=([^;\\s]*)'));

        return (cookie ? unescape(cookie[2]) : V_NOT_FOUND);
    },

    f_remove: function(pName)
    {
        ///////////////////////////////////
        // get the cookie for pName
        var cookie = this.f_get(pName) || true;

        this.f_set(pName, '', -1);

        return cookie;
    }
}
