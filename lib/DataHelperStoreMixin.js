var _ = require('lodash')
  , accessors = require('./util/expression')
  , defineStore = require('./util/define-store');

var store = {

    get: function(path){
    	return accessors.getter(path, true)(this.data) 
    },

	_set: function(path, value){
		if( arguments.length === 1){
			value = path
			path = ''
		}

    	path 
	    	? accessors.setter(path)(this.data, value)  
	    	: (this.data = value)

    	this.emitChange(path)
    	return this
    },

    _extend: function(path, value){
		if( arguments.length === 1){
			value = path
			path = ''
		}

		var obj = this.get(path)

	    if ( !_.isPlainObject(obj) ) throw new TypeError("can only extend objects")

	    _.extend(obj, value)	
		this.emitChange(path)
	},

	_remove: function(path, item){
		var array = this.get(path)
		  , idx = array.indexOf(item)

	    if (idx !== -1 ){
			array.splice(idx, 1)
			this.emitChange(path)
		}
	}
}

/*
*	Data mutation convenience methods
*/
_.each([ 'push', 'pop', 'splice', 'slice', 'shift', 'unshift' ], function(method){
	store['_' + method] = function(path){
		var array = this.get(path)
		array[method].apply(array, _.rest(arguments))
		this.emitChange(path)
	}
})

_.each([ 'extend', 'merge', 'defaults', 'transform' ], function(method){
	store['_' + method] = function(path){
		var args = _.rest(arguments)

		args.unshift(this.get(path))
	    _[method].apply(_, args)

		this.emitChange(path)
	}
})

//-----------

module.exports = store;


