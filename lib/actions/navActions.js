"use strict";
var navConstants = require('../constants/navigationConstants')
  , Actions = require('./Actions')
  , _ = require('lodash');

var actions = new Actions({
	
	start:    Actions.dispatchTo(navConstants.START),

	stop:     Actions.dispatchTo(navConstants.STOP),

	navigate: Actions.dispatchTo(navConstants.NAVIGATE),

	map: Actions.dispatchTo(navConstants.REGISTER, function(cb, send){
			var builder = new RouteBuilder()
			  , routes = []

            builder.resource('application', this.app.ApplicationView, '/', function(){
                cb.call(this)
            })
	        
	        send(builder.routes[0])
	})
})

module.exports = actions

function RouteBuilder(name, path, canNest){
    this.routes = []
    this.controllers = {}

    this.parent = name;
    this.root = path
}

RouteBuilder.prototype = {

    route: function(name, handler, path){
        route(this, name, handler, path);
    },

    resource: function(name, handler, path, cb){
        var builder;

        if( arguments.length === 3 && _.isFunction(path)){
            cb = path
            path = null 
        }

        if (!path ) path = '/' + name

        if( cb ) {
            builder = new RouteBuilder(name, path)
            cb.call(builder)
            this.add(name, path, handler, builder.routes)        
        } else {
            this.add(name, path, handler)
        }
    },

    add: function(name, path, handler, children){
        var parent = this.parent || name;

        this.routes.push({ 
            name: name, 
            pattern: path, 
            handler: handler,
            children: children
        })
    },

    flatten: function(){

        return reduce(this.routes)

        function map(routes, action, name){
            return _.map(routes, function(p){
                return { pattern: p, action: action, method: name}
            })
        }

        function reduce(arr, a){
            return _.reduce(arr, function(arr, group, b){
                return arr.concat(_.isArray(group)
                    ? map(group, a, b)
                    : reduce(group, b))
            }, [])
        }  
    }

}


function route(builder, name, handler, path) {
    if (typeof path === 'function') throw new TypeError;

    if (path == null)
        path = name;
  
    // path = _.map([].concat(path), function(path){
    //     if (builder.root && path.charAt(0) !== '/' ) 
    //         path = builder.root + '/' + path

    //     return path
    // })

    builder.add(name, path, handler)
}