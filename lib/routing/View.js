var _ = require('lodash')
  , Class = require('../core/Class')
  , compose = require('../core/compose')
  , react = require('react');

var POLICY = {

	mixins: resolve(merge),

	statics: resolve(wrap),

	propTypes: resolve(wrap),

	contextTypes: resolve(wrap),

	childContextTypes: resolve(wrap),

	getDefaultProps: resolve(merge),

	getInitialState: resolve(merge),

	getChildContext: resolve(merge),

	render: function(value, key) {
		if ( !this[key] ) this[key] = value
  	},

	componentWillMount: 	   resolve(wrap),
	componentDidMount: 		   resolve(wrap),
	componentWillReceiveProps: resolve(wrap),

  	shouldComponentUpdate: function(value, key){
		if ( !this[key] ) this[key] = value
  	},

  	componentWillUpdate: 	resolve(wrap),
  	componentDidUpdate: 	resolve(wrap),
  	componentWillUnmount:   resolve(wrap),
  	updateComponent: 		resolve(function(a,b){ return b })

};


var BaseView = new Class({
	constructor: function BaseView(props, children){
		return this.component(props, children)
	}
})

module.exports = new Class(Class, {

	constructor: function ViewClass(spec){
        if ( !(this instanceof Class) )
            return new ViewClass(spec)

        if ( typeof spec === 'function') 
            throw new Error('views cannot be inherited from')

        this.__spec__ = {}

        var factory = Class.call(this, BaseView, spec)

        factory.prototype.component = react.createClass(factory.prototype)
        //this._spec = factory.__target__.type.prototype
    },

    specPolicy: function(value, key) {
        var policy = POLICY[key]

        if (policy ) policy.call(this.__target__, value, key)
        else         this._super.specPolicy.call(this, value, key) 
    },

    ignore: function(field, value){
        return this._super.ignore.call(this, field, value) 
            || !!POLICY[field] 
    },

    mixin: function(){
    	if( this.component) throw "you cannot redefine views"
		this._super.mixin.apply(this, arguments)
    }
})





function resolve(fn) {
	return function(value, key){
		if ( !this[key]) this[key] = value
		else fn(this[key], value)
	}
}

function merge(one, two) {
	return function wrappedMethod(){
        var r1 = one.apply(this, arguments)
          , r2 = two.apply(this, arguments);

      	if( r1 == null && r2 == null) return
        if( r1 == null ) return r2
        if( r2 == null ) return r1
        else             return _.extend(r1, r2)
    }
}


function wrap(one, two) {	
	return function wrappedMethod(){
        one.apply(this, arguments)
        two.apply(this, arguments);
    }
}
