var Dispatcher = require('../dispatching/Dispatcher')
  , _ = require('lodash')
  , Trait = require('../core/Trait')
  , Class = require('../core/Class')
  , compose = require('../core/compose')
  , reservedFn = [ 'constructor' ];

module.exports = new Class(Trait, {
	constructior: function(spec){
		Trait.call(this, spec)
	},

	statics: {
		dispatchTo:  dispatchTo,
		passThrough: dispatchTo
	}
})

function dispatchTo() {
	var args = _.toArray(arguments)
	  , method = _.last(args)
	  , dispatches = _.initial(args);

  	if (typeof method !== 'function'){
  		args.push(method)
  		method = null
  	}

	return compose.resolution(function(key){
		var self = this;

		this[key] = method 
			? _.partialRight(method, send)
			: send

		function send(data) {
			_.each(dispatches, function(type){
				self.dispatcher.dispatch({action: type, data: data })
			})
		}
	})
}

