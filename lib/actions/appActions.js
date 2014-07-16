var _ = require('lodash')
  , Promise = require('bluebird')
  , Actions = require('./Actions')
  , appConstants = require('../constants/appConstants');

module.exports = new Actions({

	authenticate: Actions.dispatchTo(appConstants.AUTHENTICATE),

	start: Actions.dispatchTo(appConstants.START, function(o, send){

		send(appConstants.AUTHENTICATE, o)
	})
})




