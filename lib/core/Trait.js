"use strict";
var _ = require('lodash')
  , TraitConflictError = require('./errors').TraitConflictError
  , extend = require('../util/extend')
  , apply  = require('../util/apply')
  , compose = require('./compose');

var getDescriptor = Object.getOwnPropertyDescriptor

module.exports = Trait

var POLICY = {

	include: function(self, traits, opts) {
		traits = traits ? [].concat(traits) : []
		self.__mixins__ = _.union(self.__mixins__, traits)

     	_.each(traits, function(trait) { 
     		self.mixin(trait, opts)
     	})

     	self.__mixins__.length = 0
	},

	statics: function(self, value) {
      	_.extend(self, value)
	}
}

function Trait(spec, options){
	var self = this;

	options || (options = {})
	
	self.__target__    = options.target || self
	self.__conflicts__ = []
	self.__requireds__ = []
	self.__mixins__    = []
	self.__meta__      = {}

	self.mixin(spec, options)
    Trait.assertResolved(self) // ensure that created traits are not in a conflicted state
    //Object.freeze(this.__target__)
}

Trait.prototype = {

	mixin: function(spec, options){
        var self = this
          , target = self.__target__ || self;

      	spec 	|| (spec = {})
      	options || (options = {})

      	//self.__mixins__.push(spec)

      	_.each(spec, this.specPolicy, this)
           
        _.each(spec, function(value, name){
            if (!self.ignore(name, value))
            	self.define(name, value) 
        })
    	
    },

    define: function(name, value){
    	var self 		= this
    	  , target 		= self.__target__
    	  , exists		= _.has(target, name) && target[name] !== compose.required
	      , isRequired  = value === compose.required
	      , resolver    = value.__resolver__;

	  	if ( isRequired) {
	  		if ( resolver ) throw TypeError('You did something weird here')
	  		self.__requireds__.push(name)
		}
	    
	    if ( target[name] === compose.required)
			remove(self.__requireds__, name);

	    if ( resolver ) {
	    	if ( !exists ) 
	    		console.warn('property: "' + name + '" has a resolution but there is nothing to resolve to')

			return resolver.call(target, name, self)	
		}

		if ( !isRequired ) 
			add(self.__meta__, name, value)

		target[name] = value
    },

    specPolicy: function(value, key){
    	var policy = POLICY[key]
  		if (policy ) policy(this, value)
    },

    ignore: function(field, value){
        return /__(\w+)__/.test(field)
        	|| !!POLICY[field]  
    },

    // mixedin: function(trait){
    // 	return _.contains(this.__mixins__, function(t) {
    // 		if ( t.mixedin ) 
    // 			return t.mixedin(trait)

    // 		return _.isEqual(t, trait)
    // 	})
    // }
}

Trait.assertFullfilled= function(trait){
	if ( trait.__requireds__.length)
		throw new TraitConflictError("Required property: \"" + trait.__requireds__.join(', ') + "\" not provided");
}

Trait.assertResolved = function(trait){
	var conflicts = _.keys(_.pick(trait.__meta__, function(v){ return v.length > 1 }))

	if ( conflicts.length ) {
		throw new TraitConflictError("Conflict on property: \"" + conflicts.join(', ') + "\"")
	}
		
}

var fnTest = /xyz/.test(function () { var xyz; }) ? /\b_super\b/ : /.*/

function getMethod(fn, target, key ){
	var base = target.__super__ || target.constructor.__super__
	  , isOverride = 
	  		base 
		&& typeof fn === "function" 
		&& typeof base[key]  === "function" 
		&& fnTest.test(fn);

	if ( !isOverride  ) return fn

	return function(){
		var tmp = this._super
		  , retval;
   
        this._super = base[key];
        retval = apply(fn, this, arguments);        
        this._super = tmp;
        return retval;
	}
}


function remove(arr, item){
	var idx = arr.indexOf(item)
	if (idx !== -1) arr.splice(idx, 1)
}

function add(obj, key, value) {
	obj[key] = _.uniq(( obj[key] || []).concat(value))
}