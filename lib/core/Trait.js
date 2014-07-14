var _ = require('lodash')
  , TraitConflictError = require('./errors').TraitConflictError
  , extend = require('../util/extend')
  , apply  = require('../util/apply')
  , compose = require('./compose');

var getDescriptor = Object.getOwnPropertyDescriptor

module.exports = Trait

var POLICY = {

	include: function(self, target, traits, opts){
		target.__includes__ = traits = traits ? [].concat(traits) : []

     	_.each(traits, function(trait){ 
     		self.mixin(trait, opts)
     	})
	},

	statics: function(self, target, value){
      	_.extend(self, value)
	}
}

function Trait(spec, options){
	var self = this;

	self.__target__ = self
	self.__conflicts__ = []
	self.__requireds__ = []

	self.mixin(spec, options)
    Trait.assertResolved(self) // ensure that created traits are not in a conflicted state
}

Trait.prototype = {

	mixin: function(spec, options){
        var self = this
          , target = self.__target__ || self;

      	spec 	|| (spec = {})
      	options || (options = {})

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
    	if ( exists && !resolver && !isRequired && !_.isEqual(value, target[name]) ) 
    		self.__conflicts__.push(name)
	    
	    if ( resolver ) {
	    	if ( !exists ) 
	    		console.warn('property: "' + name + '" has a resolution but there is nothing to resolve to')

	    	remove(self.__conflicts_, name);
			return resolver.call(target, name, self)	
		}

		if ( target[name] === compose.required)
			remove(self.__requireds__, name);

		target[name] = value //getMethod(value, target, name)
    },

    specPolicy: function(value, key, options){
    	var policy = POLICY[key]
  		if (policy ) policy(this, this.__target__, value, options)
    },

    ignore: function(field, value){
        return /__(\w+)__/.test(field)
        	|| !!POLICY[field]  
    }
}

Trait.assertFullfilled= function(trait){
	if ( trait.__requireds__.length)
		throw new TraitConflictError("Required property: \"" + trait.__requireds__.join(', ') + "\" not provided");
}

Trait.assertResolved = function(trait){
	if ( trait.__conflicts__.length)
		throw new TraitConflictError("Conflict on property: \"" + trait.__conflicts__.join(', ') + "\"")
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