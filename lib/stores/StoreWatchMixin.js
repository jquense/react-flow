var _ = require('lodash')

module.exports = function(){
	var stores = _.toArray(arguments)

	return {
		componentWillMount: function() { 
			var onChange = this._onStoreChange;

			_.each(stores, function(store){
				store.listen(onChange); 
			})
		}, 

		componentWillUnmount: function() { 
			var onChange = this._onStoreChange;

			_.each(stores, function(store){
				store.stopListening(onChange); 
			})
		}, 

		getInitialState: function(){
			return this.getStoreState()
		},

		_onStoreChange: function(){
			this.setState(this.getStoreState())
		}
	}
}