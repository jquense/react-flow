"use strict"
var _ = require('lodash')
  , pathRegex = require('path-to-regexp');

module.exports = Route

function Route(options) {
    var self = this
      , keys = [];

    if (!(this instanceof Route))
        return new Route(options)

    this.name     = options.name
    this.handler  = options.handler
    this.pattern  = options.pattern.charAt(0) === '/' ? options.pattern.substr(1) : options.pattern
    this.children = _.map(options.children, Route)

    this.regex = pathRegex(this.pattern, keys)
    this.optionals = 0
    this.repeats = 0

    this.keys = _.map(keys, function(key) {

        key.replaceRegex = replaceRegex(key)

        if( key.optional) self.optionals++
        if( key.repeats ) self.repeats++

        return key
    });

};

Route.prototype = {

    match: function(fragment){
        return match(fragment, this)  
    },

    generate: function(params, query){
        var keys = this.keys
          , path = this.pattern
          , value, key, provided;

        _.each(keys, function(key, idx){
            provided = _.has(params, key.name)
            value = params[key.name]
            
            if( provided )
                path = path.replace(key.replaceRegex, value)
            else {
                if( !key.optional ) return null
                else path = path.replace(key.replaceRegex, '').replace('//', '/')
            }
        })

        return path.replace(/^[#\/]|\s+$/g, '')
    }
}

function match(fragment, route){
    var subs = route.children
      , matches, root, params;

    _.any([].concat(subs), function(c){
        return matches = match(fragment, c)
    })

    if( matches ) {
        params = {}
        root = _.last(matches)

        _.transform(route.keys, function(o, val){
            params[val] = root.params[val]
        }, params)

        matches.unshift({ route: route, params: params})
        return matches
    }

    params = getParams(fragment, route)

    return params 
        ? [{ route: route, params: params}]
        : null
}

function getParams(fragment, route){
    var match  = route.regex.exec(fragment)
      , keys   = route.keys
      , params = {}

    if(!match) return null

    return _.transform(match.slice(1), function(obj, val, idx){
        obj[keys[idx].name] = val
    }, {})
}

function replaceRegex( key) {
    var suffix = key.optional 
        ? key.repeat ? '\\*' : '\\?'
        : key.repeat ? '\\+' : ''

    return RegExp(':' + key.name + suffix, 'ig')
}
