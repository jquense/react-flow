var Flow = require('react-flow')
  , on = Flow.defineStore.listenFor
  , Url = require('url')
  , Promise = require('bluebird')
  , _ = require('lodash')
  , appConstants = require('../constants/appConstants');

module.exports = Flow.defineStore({

    mixins: [ Flow.DataHelperStoreMixin ],

    getInitialData: function(){
        //localStorage.removeItem('porch_access_token')
        //localStorage.removeItem('porch_refresh_token')

        return {
            started:       false,
            authorized:    false,
            access_token:  localStorage.getItem('porch_access_token'),
            refresh_token: localStorage.getItem('porch_refresh_token')
        }
    },

    actions: [

        on(appConstants.START, function(options){
            this._extend(options)
        }),

        on(appConstants.AUTHENICATE, function(){
            var query = Url.parse(location.href, true).query
              , token = this.get('access_token')
              , hash = splitHash() || {}

            if(!this.data.started) return

            if ( token ) return this._set('authenticated', true)
            
            if ( location.pathname === this.get('redirectUri')) {

                if (location.hash && hash.access_token) 
                    this._setTokens(hash.access_token, hash.refresh_token)
                
                else if (query.code !== undefined) 
                    this._requestAccessToken(this.get('redirectUri'), query.code, 'my_client')

                else if (query.error )
                    throw new Error(query.error + ': ' + query.error_description)
            }
            else
                this._requestAuthCode(this.get('redirectUri'), 'my_client')
        })

    ],

	_requestAuthCode: function( landingPoint, clientId ){
        var redirect = location.origin + landingPoint
          , query = '/oauth/authorize?response_type=token&client_id=' + clientId + '&redirect_uri=' + redirect
        
        window.location = this.get('server') + query
    },

    _requestAccessToken: function( redirect, code, clientId ){
        var self = this
          , url = this.server +'/oauth/token'
          , xhr = $.ajax(url, {
            method: 'POST',
            data: {
                grant_type: 'authorization_code',
                client_id: clientId,
                redirect_uri: location.origin + redirect,
                code: code
            }    
        })
        
        return xhr.then(function(rsp){
            self._setTokens(resp.access_token, resp.refresh_token)
        })
    },

    _setTokens: function(access, refresh){
    	access  && localStorage.setItem('porch_access_token', access)
        refresh && localStorage.setItem('porch_refresh_token', refresh)

        this._extend({
            authenticated: !!access,
            access_token: access,
            refresh_token: refresh
        });
    }
})






function splitHash(){
    var qry = location.hash.substring(1)
    
    qry = qry.split('&')

    return _.reduce(qry, function(rslt, item){
        var idx = item.indexOf('=')
          , key = item, val = ''
          ;
          
        if (idx >= 0) {
            key = item.substring(0, idx)    
            val = item.substring(idx + 1)
        }
        rslt[key] = val;
        return rslt;
    }, {})
}