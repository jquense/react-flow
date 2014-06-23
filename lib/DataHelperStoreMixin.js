var _ = require('lodash')
  , accessors = require('./util/expression')
  , defineStore = require('./util/define-store');

var store = {

	_remove: function(path, item){
		var array = this.get(path)
		  , idx = array.indexOf(item)

	    if (idx !== -1 ){
			array.splice(idx, 1)
			this.emitChange(path)
		}
	},

	_add: function(path, items){
		this._push.apply(this, [path].concat(items) )
    },
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

		if( typeof path !== 'string')
			args.unshift(this.data, path)
		else
			args.unshift(this.get(path))

	    _[method].apply(_, args)

		this.emitChange(path)
	}
})

//-----------

module.exports = store;


