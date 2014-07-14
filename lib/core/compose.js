var _ = require('lodash')
  , TraitConflictError = require('./errors').TraitConflictError
  , compose = {};


function resolution(fn, direct){
	function resolution(){
		if ( direct ) return direct.apply(this, arguments)
	}

	resolution.__resolver__ = fn
	return resolution
}

function advice(setter) {
	return function (method) {
		var args = _.toArray(arguments)
		  , method = _.last(args)
		  , overrides = _.initial(args)

		return resolution(function(key, self){
			var traits  = overrides.length ? overrides : this.__includes__ || []
			  , parents = _.pluck(traits, key)
			  , base    = this[key]

			if ( base && !_.contains(parents, base) )
				parents.push(base)

			this[key] = setter(method, parents)
		})
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

