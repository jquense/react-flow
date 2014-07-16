var _ = require('lodash')
  , Class = require('./Class')
  , TraitConflictError = require('./errors').TraitConflictError
  , compose = {};

// var Descriptor = new Class({

// 	constructor: function Descriptor(descriptor, options) {
// 		options || (options || {})

// 		if ( !isDescriptor(descriptor) )
// 			descriptor = {
// 				enumerable: true, writable: true, configurable: true,
// 				value: descriptor
// 			}

// 		this.descriptor = descriptor
// 	},

// 	attach: function(obj, key, klass) {
// 		var descriptor = this.descriptor;

// 		Object.defineProperty(obj, key, descriptor);
// 		klass.__meta__[key].push(obj[key])
// 	}
// }

function resolution(fn, direct){
	function Descriptor(){
		if ( direct ) return direct.apply(this, arguments)
		throw "Unapplied Descriptor"
	}

	Descriptor.__resolver__ = fn
	return Descriptor
}



function advice(composer) {
	return function (method) {
		var args = _.toArray(arguments)
		  , method = _.last(args)
		  , specified = _.pluck(_.initial(args), '__target__');

		return resolution(attach)

		function attach(key, self){
			var chain	= self.__meta__[key] || []
			  , parents = specified.length ? _.compact(_.pluck(specified, key)) : chain 
			  , composed;

		  	self.__meta__[key] = without(self.__meta__[key], parents)
			this.define(key, composer(method, parents))
		}
	}
}

function chain(iterator, reverse){

	return advice(function(method, parents){
		parents.push(method);

		if ( reverse ) 
			parents.reverse()

		return _.reduce(parents, function(merged, method, idx){
			if ( idx === 0 ) return method
			return iterator(merged, method)
		})

	})
}

module.exports = compose = {

	required: function required(){ throw new TraitConflictError('this method is required!') },

	resolution: resolution,

	advice: advice,

	around: advice(function(method, parents) {
		var base = _.reduce(parents, function(merged, method, idx){
			if ( idx === 0 ) return method
			return wrap(merged, method)
		})

		return _.partial(method, base)
	}),

	override: function(fn){
		return resolution(function(key){
			this[key] = fn
		})
	},

	chain:  chain,

	merge:  chain(merge),

	after:  chain(wrap),

	before: chain(wrap, true),

	or: chain(function(parent, child){
		return function wrappedMethod(){
	        return parent.apply(this, arguments) 
	        	|| child.apply(this, arguments)
	    }
	}),

	and: chain(function(parent, child){
		return function wrappedMethod(){
	        return parent.apply(this, arguments) 
	        	&& child.apply(this, arguments)
	    }
	})
}


function merge(a, b){
    if ( typeof a !== typeof b) throw new TypeError
    else if ( _.isArray(a) )    a.splice(a.length, 0, b)    
    else if ( _.isFunction(a) ) a = wrap(a, b)  
    else                        _.extend(a, b)
    return a
}

function wrap(one, two) {
    return function wrappedMethod(){
        var r1 = one.apply(this, arguments)
          , r2 = two.apply(this, arguments);

      	if( r1 == null && r2 == null) return
        if( r1 == null ) return r2
        if( r2 == null ) return r1
        else             return _.extend(r1, r2)
    }
}

function without(arr, arr2){
	return _.reject(arr, function(item){
		return _.contains(arr2, item)
	})
}


function isDescriptor(obj){
	var keys = ['enumerable', 'writable', 'value', 'configurable', 'get', 'set']

	return _.size(obj) !== 0 
	    && _.all(obj, function(v, key){ 
	    	return _.contains(keys, key) 
	    })
}