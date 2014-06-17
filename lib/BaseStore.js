var Dispatcher = require('./Dispatcher')
  , EventEmitter = require('events').EventEmitter
  , _ = require('lodash')
  , defineStore = require('./util/define-store');

module.exports = BaseStore;

BaseStore.define = defineStore

function BaseStore(options){
	options || (options = {})

	var self = this 
	  , actions = options.actions || this.constructor.__actions__
	  , refs = [].concat(options.refs || []);

	this.id   = options.id   || _.uniqueId('store_');
	this.data = options.data || this.getInitialData(options);

	actions = _.mapValues(actions, function(fn){
		return _.bind(fn, self)
	})

	Dispatcher.register(this, function(payload) { 
	    var action = payload.action; 

    	if ( typeof actions[action] !== 'function' )
    		return

	    return actions[action].apply(self, [].concat(payload.data))
  	})

	this.refs = _.mapValues(this.refs, function(type, key){
		var instance = getInst(refs, type)
		if( !instance ) throw new TypeError('Unmet store dependency: "' + key + '"');
		return instance
	})

	this.initialize.call(this, options)
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

    get: function(){
    	return this.data
    },

	_set: function(data){
    	this.data = data || {}
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