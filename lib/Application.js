var React = require('react')
  , Dispatcher      = require('./dispatching/Dispatcher')
  , Registry		= require('./di/Registry')
  , Resolver 		= require('./di/Resolver')
  , DataAccessStore = require('./stores/DataAccessStore')
  , routerActions   = require('./actions/navActions')
  , RouterStore     = require('./stores/NavigationStore')
  , AppStore        = require('./stores/AppStore')
  , appActions      = require('./actions/appActions')
  , appConstants    = require('./constants/appConstants')

   //, Router = require('./Router')

module.exports = {

	create: function(options){
		var app = new Application

		app.container.resolve('dispatcher:main')
			.register('Application', function(payload){
				var action = payload.action

				if( action === appConstants.START )
					app.mount(app.routerStore.get(), app.children)
			})

		return app
	}
}


function Application(){
	this.resolver  = new Resolver(this)
	this.container = new Registry(this.resolver)

	this.container.optionsForType('actions', { instantiate: false })
	this.container.optionsForType('view', { instantiate: false })

	this.container.register('application:main', this, { instantiate: false })

	this.container.register('dispatcher:main', Dispatcher)

	this.container.register('store:dal', DataAccessStore)
	this.container.register('store:app', AppStore)
	this.container.register('store:router', RouterStore)

	this.container.register('actions:app', appActions )
	this.container.register('actions:routing', routerActions )

	this.container.inject('store',   'dispatcher', 'dispatcher:main')
	this.container.inject('actions', 'dispatcher', 'dispatcher:main')
	//this.container.resolve('store:dal')
	this.container.resolve('store:app')

	//this.container.inject('store', 'dal', 'store:dal')
	this.container.inject('store', 'appState', 'store:app')
	this.container.inject('actions:routing', 'app', 'application:main')

	this.appActions = this.container.resolve('actions:app')

	this.routerActions = this.container.resolve('actions:routing')
	this.routerStore   = this.container.resolve('store:router')
}


Application.prototype = {

	mount: function(props, children){

		React.renderComponent(this.ApplicationView(props), document.body);
	},

	get: function(key, type){
		key = key + type.charAt(0).toUpperCase() + type.substr(1)

		return this[key]
	},

	_component: function(){
		var app = this;

	 	return React.createClass({
	 		displayName: 'Application', 

			childContextTypes: {
		        app: React.PropTypes.instanceOf(Application)
		    },

		    getChildContext: function() {
	      		return { app: app };
		    },

			componentWillMount: function() { 
				app.routerStore.listen(this._onRouteChange); 
			}, 

			componentWillUnmount: function() { 
				app.routerStore.stopListening(this._onRouteChange); 
			},

			render: function(){
				return React.DOM.div(null, this.props.children)
			},

			_onRouteChange: function(){

			}
		})
	 }
}