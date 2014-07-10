var _ = require('lodash')
  , TraitConflictError = require('./errors').TraitConflictError
  , extend = require('../util/extend')
  , CoreObject = require('./Object');

module.exports = Trait

function Trait(resolvers, data){

	if ( arguments.length === 1 ){
		data= resolvers
		resolvers = {}
	}

	Object.defineProperty(this, '_resolvers', { 
		enumerable: false,
		value: Object.freeze(_.extend({}, resolvers || {}))
	 })

	_.extend(this, data)
}

Trait.prototype = {

	resolve: function(resolutions){
		return Trait.resolve(this, resolutions)
	},
}

/*
	{ oldName: 'newname' }
	{ oldName: undefined }
	function( 1 , 2)
*/

Trait.resolve = function(trait, resolutions){
	var changes
	  , resolvers = _.clone(trait._resolvers || {}); 
	
	changes = _.transform(trait, function(obj, val, key){
		var r = resolutions[key]

		if ( _.has(resolutions, key) ) {
			if( typeof r === 'function'  ){
				resolvers[key] = r
				obj[key] = val

			} else if ( r !== undefined)
				obj[r] = val

		} else
			obj[key] = val
	})

	return new Trait(resolvers, changes)
}


Trait.composeInto = function(proto, traits) {
  	_.each(traits, function(trait){
  		compose(proto, trait)
  	})
}

Trait.compose = function(traits) {
	var composed = {};

  	_.each(traits, function(trait){
  		compose(composed, trait)
  	})

	return new Trait(composed)
}

Trait.resolutions = {
	merge: merge,
	chain: wrap,
	override: function(a, b){
		return b
	},
}

function compose(proto, trait) {
	if ( !(trait instanceof Trait) )
		throw new TypeError('Not A Trait instance')

    _.each(trait, function(value, name){
        var isInherited = name in proto
          , resolver = (trait._resolvers || {})[name];

        if ( isInherited && value !== undefined && !resolver ) 
        	throw new TraitConflictError("Conflict on property: \"" + name + "\"")

        if ( resolver && !value )
        	throw new TraitConflictError("Resolution provided for: \"" + name + "\" but there is nothing to resolve!")

        if ( resolver )
        	proto[name] = resolver(proto[name], value)
        else
        	proto[name] = value
    })
}

function merge(a, b){
    if ( typeof a !== typeof b) throw new Error
    else if ( _.isArray(a) )    a.splice(a.length, 0, b)    
    else if ( _.isFunction(a) ) a = wrapMerge(a, b)  
    else                        _.extend(a, b)
    return a
}

function wrap(one, two) {
    return function wrappedMethod(){
        one.apply(this, arguments);
        two.apply(this, arguments)
    }
}

function wrapMerge(one, two) {
    return function wrappedMethod(){
        var r1 = one.apply(this, arguments)
          , r2 = two.apply(this, arguments);

        if( r1 == null ) return r2
        if( r2 == null ) return r1
        else             return _.extend(r1, r2)
    }
}
