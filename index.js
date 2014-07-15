var BaseStore = require('./lib/stores/BaseStore')
  , defineStore = require('./lib/stores/define-store')
  , namespace = {};

module.exports.create = require('./lib/Application').create

module.exports.Stores = {

	StoreFactory: defineStore,

	listenFor: defineStore.listenFor,
	
	StoreWatchMixin: require('./lib/stores/StoreWatchMixin'),

	DataHelperStoreMixin: require('./lib/stores/DataHelperStoreMixin')

}

module.exports.DataAccess = {

	Model: require('./lib/dal/Model'),

	Collection: require('./lib/dal/Collection')
}

module.exports.Actions = require('./lib/actions/actions')

module.exports.DataAccess = {

	field: require('./lib/dal/Field').create,

	Model: require('./lib/dal/Model'),

	Collection: require('./lib/dal/Collection')
}