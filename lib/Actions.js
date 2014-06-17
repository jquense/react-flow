var Dispatcher = require('./Dispatcher')
  , _ = require('lodash')
  , reservedFn = [ 'constructor' ];

module.exports = createActions

function createActions(def){
	return new Actions(def)
}

createActions.passThrough = function(){
	var args = _.initial(arguments)
	  , send = _.last(arguments)

	send(args); 
}

function Actions(options){
	var self = this
	  , actions = {}
	  , prefix  = options.prefix;

	options || (options = {})

	priv = _.pick(options, function(fn, action){
		return action.charAt(0) === '_'
	})

	actions = _.omit(options, function(fn, action){
		return typeof fn !== 'function' || _.contains(reservedFn, action) || action.charAt(0) === '_' 
	})

	actions = _.mapValues(actions, function(fn, action){
		function send(data){
			Dispatcher.dispatch({
				action: prefix ? prefix + action : action,
				data: data
			})
		}

		return _.partialRight(fn, send)
	})

	_.extend(this, priv, actions)
}


