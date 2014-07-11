var _ = require('lodash')
  , TraitConflictError = require('./errors').TraitConflictError
  , extend = require('../util/extend')
  , CoreObject = require('./Object');

var getDescriptor = Object.getOwnPropertyDescriptor

module.exports = Trait

// function Trait(resolvers, ctor){

// 	if ( arguments.length === 1 ){
// 		ctor= resolvers
// 		resolvers = {}
// 	}

// 	Object.defineProperty(this, '_resolvers', { 
// 		enumerable: false,
// 		value: Object.freeze(_.extend({}, resolvers || {}))
// 	 })

// 	_.extend(this, ctor.call(this))
// }

function Trait(resolvers, data){
	var self = this;

	if ( arguments.length === 1 ){
		data = resolvers
		resolvers = {}
	}

	if ( typeof data === 'function' ) 
		data = data.call(this)

	if ( !_.isObject(data) ) 
		throw new TypeError('Traits must be initialized with data')

	_.each(_.keys(data), function(key){
		var desc = Object.getOwnPropertyDescriptor(data, key)
		  , isRequired  = desc.value === required
		  , hasResolver = _.has(resolvers, key)

	  	if (isRequired) 
	  		makeRequired(desc)

	  	if ( hasResolver)
	  		desc.resolver = resolvers[key]

		self[key] = desc
	})
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
	var changes; 
	
	changes = _.transform(trait, function(obj, descriptor, key){
		var val = descriptor.value
		  , resolution = resolutions[key];

		if ( _.has(resolutions, key) ) {

			if( typeof resolution === 'function'  ){
				resolvers[key] = function(a) { return resolution(a, val, key) }
				obj[key] = Trait.required

			} else if ( resolution !== undefined)
				obj[resolution] = val

		} else
			obj[key] = val
	})

	return new Trait(resolvers, changes)
}

Trait.create = function(proto, traits){
	var obj = Object.create(proto);

	return Trait.composeInto(obj, traits)
}

Trait.composeInto = function(proto, traits) {
	var props = {}
	  , trait = this.compose(traits)
	  , isEqual;

	_.each(trait, function(descriptor, key){
		var resolver   = descriptor.resolver
		  , isRequired = descriptor.required
		  , protoDesc = getDescriptor(proto, key)

		descriptor = _.omit(descriptor,'required')

		if ( isRequired ) {
			if ( !(key in proto) ) throw new TraitConflictError("Required property: \"" + key + "\" not provided")
			else descriptor.value = proto[key].value
		}
			

		if ( _.has(proto, key) && !_.isEqual(protoDesc, descriptor)) 
			throw new TraitConflictError("Conflict on property: \"" + name + "\"")
		
		Object.defineProperty(proto, key, descriptor)	
	})

	return proto
}

Trait.compose = function(traits) {
	var composed  = {}
	  , composeIt = _.partial(compose, composed);

  	traits = [].concat(traits)

  	if ( traits.length === 1 ) 
  		return traits[0]

  	_.each(traits, composeIt)

  	//checkRequired(composed, requireds)

	return _.create(Trait.prototype, composed)
}

_.extend(Trait, {
	required: required,
	merge: merge,
	chain: wrap,
	after: wrap,
	before: function(a,b){ 
		return wrap(b, a) 
	}
})

function makeRequired(desc){
	desc.required = true
	desc.value    = undefined;
}

function required(){ throw new TraitConflictError('this method is required!') }

function checkRequired(composed, hash) {
	for ( var key in hash )
		if ( !_.has(composed, key)) 
			throw new TraitConflictError("Required property: \"" + key + "\" not provided")
}

function compose(proto, trait) {

	if ( !(trait instanceof Trait) )
		throw new TypeError('Not A Trait instance')

    _.each(trait, function(desc, name){
        var isInherited = _.has(proto, name)
          , value 	    = desc.value
          , isRequired  = desc.required
          , resolver    = desc.resolver;

      	if ( isInherited && !proto[name].required ) {
      		if ( isRequired ) return 
        	if ( !_.isEqual(proto[name], desc) ) 
        		throw new TraitConflictError("Conflict on property: \"" + name + "\"")
        }

        if ( resolver ) 
        	desc.value = resolver(proto[name].value)

    	proto[name] = desc
    })
}

function merge(a, b){
    if ( typeof a !== typeof b) throw new TypeError
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

var fnTest = /xyz/.test(function () { var xyz; }) ? /\b_super\b/ : /.*/
function isOverride(value, base) {
    return typeof value === "function" && typeof base === "function" && fnTest.test(value); // Check if we're overwriting an existing function
}

function addOrPush(obj, key, val){
	var existing = obj[key]

	obj[key] = existing 
		? [].concat(existing, val) 
		: [].concat(val)
}