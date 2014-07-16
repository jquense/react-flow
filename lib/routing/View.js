var _ = require('lodash')
  , Class = require('../core/Class')
  , compose = require('../core/compose')
  , react = require('react');

var POLICY = {

  	mixins: function(target, value){
        target.mixins || (target.mixins = [])
        target.mixins = target.mixins.concat(value)
    },

  	statics: function(target, value){
        target.statics = value
    },

  	propTypes: toMixin,

  	contextTypes: toMixin,

  	childContextTypes: toMixin,

  	getDefaultProps: toMixin,

  	getInitialState: toMixin,

  	getChildContext: toMixin,

  	render: toMixin,

  	componentWillMount: 	   toMixin,
  	componentDidMount: 		   toMixin,
  	componentWillReceiveProps: toMixin,

  	shouldComponentUpdate: toMixin,

  	componentWillUpdate: 	toMixin,
  	componentDidUpdate: 	toMixin,
  	componentWillUnmount:   toMixin,
  	updateComponent: 		toMixin

};




module.exports = new Class(Class, {

	constructor: function ViewClass(spec){
        var factory, component;

        if ( !(this instanceof Class) )
            return new ViewClass(spec)

        if ( typeof spec === 'function') 
            throw new Error('views cannot be inherited from')
    
        factory = Class.call(this, new Class({
                constructor: function BaseView(props, children){
                    return component(props, children)
                }
            }), spec)

        component = react.createClass(factory.prototype)
        //this._spec = factory.__target__.type.prototype
    },

    specPolicy: function(value, key) {
        var policy = POLICY[key]

        if (policy ) policy(this.__target__, value, key)
        else         this._super.specPolicy.call(this, value, key) 
    },

    ignore: function(field, value){
        return this._super.ignore.call(this, field, value) 
            || !!POLICY[field] 
    },

    mixin: function(){
    	//if( this.component) throw "you cannot redefine views"
		this._super.mixin.apply(this, arguments)
    }
})


function toMixin(target, value, key) {
    var obj = {}

    target.mixins || (target.mixins = [])

    for(var i =0; i < target.mixins.length; i++)
        if( !target.mixins[i][key] ) return target.mixins[i][key] = value

    obj[key] = value
    target.mixins.push(obj)
}


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
