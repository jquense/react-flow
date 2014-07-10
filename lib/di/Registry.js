var _ = require('lodash');

module.exports = Registry

function Registry (resolver){
	this.resolver = resolver || _.noop
	this.registry = {}
	this.cache = {}
	
	this._typeOptions = {}

	this._typeInjections = {}
	this._injections = {}
}


Registry.prototype = {

	factoryFor: function(name){
		if( ctx.registry[name] ) 
			return ctx.registry[name].factory

		return ctx.resolver.resolve(name)
	},

	resolve: function(name){
		var item = this.registry[name]
		  , opts = options(this, name)
		  , factory = this.factoryFor(this, name)
		  , inst;

  		if( _.has(this.cache, name) && opts.singleton !== false)
  			return this.cache[name]

  		inst = opts.instantiate !== false
  			? create(factory, injections(this, name)) 
  			: _.extend(factory, injections(this, name))

  		//if ( !_.isObject(inst) ) throw new TypeError('can only inject objects')

  		if ( opts.singleton !== false )
  			this.cache[name] = inst

  		return inst
	},

	register: function(name, Factory, options){
		this.registry[name] = {
			options: options || {},
			factory: Factory
		}
	},

	inject: function(name, prop, target){
		var isForType = !_.contains(name, ':')

		addOrPush(isForType 
			? this._typeInjections 
			: this._injections, name, { prop: prop, name: target })

	},

	optionsForType: function(type, options){
		this._typeOptions[type] = _.extend(this._typeOptions[type] || {}, options)
	}
}

function create(factory, injections){
	function injected(deps){
		_.extend(this, deps)
		factory.call(this)
	}

	injected.prototype = factory.prototype
	return new injected(injections)
}


function injections(ctx, name){
	var injections = []
	  , typeInjections = ctx._typeInjections[getType(name)];

	if ( typeInjections) 
		typeInjections = _.reject(typeInjections, { name: name })

	injections = [].concat(typeInjections || [])
	injections = injections.concat(ctx._injections[name] || [])

	injections = _.transform(injections, function(obj, inject){
		var factory = ctx.resolve(inject.name) 

		if ( !factory ) throw new Error('unknown injection: ' + inject.name) 

		obj[inject.prop] = factory
	}, {})

	injections.container = ctx

	return injections
}

function options(ctx, name){
	var typeOpts = ctx._typeOptions[getType(name)] || {}
	  , options = ctx.registry[name] && ctx.registry[name].options

	  return _.extend({}, typeOpts, options )
}

function getType(name){
	if ( _.contains(name, ':') ) return name.split(':')[0]
	return name
}

function addOrPush(obj, key, val){
	var existing = obj[key]

	obj[key] = existing 
		? [].concat(existing, val) 
		: [].concat(val)
}