var _ = require('lodash')
  , Promise = require('bluebird')
  , action = require('./Actions')
  , appConstants = require('../constants/appConstants');

module.exports = {

	authenticate: action.dispatchTo(appConstants.AUTHENTICATE),

	start: action.dispatchTo(appConstants.START, function(o, send){

		send(appConstants.AUTHENTICATE, o)
	})
}




