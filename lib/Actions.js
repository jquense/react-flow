var Dispatcher = require('./Dispatcher')
  , _ = require('lodash')
  , reservedFn = [ 'constructor' ];

module.exports = {
	create: 	 create,
	dispatchTo:  dispatchTo,
	passThrough: passThrough
}


function dispatchTo(){
	var types = _.initial(arguments)
      , cb = _.last(arguments);

  	if(typeof cb !== 'function')
  		cb = function(){
			var args = _.initial(arguments)
			  , send = _.last(arguments);

			send(args);
		}

	return create(types, cb)
}

function passThrough(dispatches){
	return dispatchTo(dispatches)
}


function create(dispatches, handler){
	var self = this;

	if( arguments.length === 1) {
		handler = dispatches
		dispatches = null;
	}

	if( !handler ) throw new TypeError

  	return _.partialRight(handler, send)

	function send(type, data){
		if( arguments.length === 1) {
			data = type
			type = null;
		}

		if( type )
		 	Dispatcher.dispatch({
				action: type,
				data: data
			})

		_.each(dispatches, function(type){
			Dispatcher.dispatch({
				action: type,
				data: data
			})
		})
	}
}


