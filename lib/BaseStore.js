var Dispatcher = require('./Dispatcher')
  , Promise = require('bluebird')
  , EventEmitter = require('events').EventEmitter
  , expr = require('./util/expression')
  , _ = require('lodash');

module.exports = BaseStore;

function BaseStore( options){
	options || (options = {})

	var self = this 
	  , actions = this.constructor.actions
	  , refs = [].concat(options.refs || []);

	this.id   = options.id   || _.uniqueId('store_');
	this.data = options.data || this.getInitialData(options);

	Dispatcher.register(this, function(payload) { 
	    var action   = payload.action
	      , handlers = getHandlers(action); 

    	if ( !handlers || !handlers.length )
    		return

	    return Promise.map(handlers, function(handler){
	    	return handler.apply(self, [].concat(payload.data))
	    })
  	})

	this.refs = _.mapValues(this.refs, function(type, key){
		var instance = getInst(refs, type)
		if( !instance ) throw new TypeError('Unmet store dependency: "' + key + '"');
		return instance
	})

	this.initialize.call(this, options)

	function getHandlers(type){
		var v = _.where(actions, function(a){
			return _.contains(a.types, type)
		})

		return _.pluck(v, 'handler')
	}
} 

_.extend(BaseStore.prototype, {

	initialize: function(){},

	getInitialData: function(){ return {} },

	emitChange: function(){
		EventEmitter.prototype.emit.apply(this, ['change'].concat(_.toArray(arguments)) )
	},

	listen: function(fn){
		EventEmitter.prototype.addListener.call(this, 'change', fn)
	},

	stopListening: function(fn){
		EventEmitter.prototype.removeListener.call(this,'change', fn)
	},

	get: function(path){
    	return expr.getter(path, true)(this.data) 
    },

	_set: function(path, value){
		if( arguments.length === 1){
			value = path
			path = ''
		}

    	path 
	    	? expr.setter(path)(this.data, value)  
	    	: (this.data = value)

    	this.emitChange(path)
    	return this
    },


	waitFor: function(stores) {
		stores = _.map([].concat(stores), function(store){
			return typeof store === 'string'
				? store 
				: store.id 
		})

		return Dispatcher.waitFor(this, stores)
	},
});



function getInst(insts, type ){
	var useId = typeof type === 'string'

	return _.find(insts, function(i){ 
		return useId ? i.id === type : (i instanceof type)
	})
}
