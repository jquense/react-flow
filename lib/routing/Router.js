"use strict"
var _ = require('lodash')
  , navActions = require('../actions/navActions')
  , Route = require('./Route')
  , NavStore   = require('../stores/NavigationStore');

module.exports = Router

function Router(options, app) {
    this.store = new NavStore(options)

    this.store.listen(function(){

    })
};

Router.prototype = {

    map: function(cb){
        var builder = new RouteBuilder()

        cb.call(builder)

        this.routes = builder.routes
        this._flattened = _.reduce(this.routes, function(arr, group){
            return arr.concat(
                _.reduce(group, function(arr, routes){
                    return arr.concat(routes)
                },[])
            )
        }, [])

        navActions.route_register()

        return this
    },

    start: function() {
        if( this.store.get('started') === false)
            navActions.route_start()

        return this
    },

    stop: function(){
        if( this.store.get('started') === true)
            navActions.route_stop()

        return this
    }
}


