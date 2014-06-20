var Policy = require('./policy');

module.exports = {

	actions: null,
	
	refs: Policy.MANY_MERGE,

	getActions: Policy.MANY_MERGE,

	getInitialData: Policy.MANY_MERGE,

	get: Policy.ONCE,

	_set: Policy.ONCE,

	emitChange: Policy.ONCE,

	listen: Policy.ONCE,

	stopListening: Policy.ONCE,

	waitFor: Policy.ONCE,
}