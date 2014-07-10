var _ = require('lodash')
  , react = require('react');

var RESERVED = {

	stores: function(proto, stores){

		proto.mixins = (proto.mixins || []).concat({
			componentWillMount: function(){

				this.stores = _.map(stores, function(store){
					return this.container.resolve('store:' + store)
				}, this)
			}
		})
	}
}

module.exports = createView

function createView (def){
	var proto = _.omit(def, 'stores', 'mixins');

	_.each(def, function(val, key){

		if( _.has(RESERVED, key) )
			RESERVED[key](proto, val)
		else
			proto[key] = value
	})

	return react.createClass(proto)
}