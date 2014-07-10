var _ = require('lodash')
  , extend = require('../util/extend')
  , DefPolicy = require('../def/policy')
  , StoreDef = require('../def/store-def')
  , BaseStore = require('./BaseStore')
  , Listener = require('../util/ActionListener')

var RESERVED_KEYS = {

    mixins: function(ctor, mixins){
        _.each(mixins, _.partial(mixInto, ctor))
    },

    actions: mergeActions,

}

module.exports = defineStore

defineStore.listenFor = function(){
    var types = _.initial(arguments)
      , cb = _.last(arguments);

    if( arguments.length < 2) 
        throw new  TypeError('An Action Listener needs at least one type and a handler')

    return new Listener(types, cb)
}

function defineStore( def ) {
    var Child = function Child(options){ return base.call(this, options) }
      , Surrogate = function(){ this.constructor = Child; }
      , base = BaseStore
      , actions;

    Surrogate.prototype = base.prototype
    Child.prototype = new Surrogate

    mixInto(Child, def)

    return Child
}


function mixInto(ctor, def){
    var proto = ctor.prototype;

    _.each(def, function(value, name){
        var isInherited = name in proto;

        if( _.has(RESERVED_KEYS, name) )
            RESERVED_KEYS[name](ctor, value)

        else if( isInherited ) {

            if ( StoreDef[name] === DefPolicy.MANY_MERGE )
                proto[name] = merge(proto[name], value)

            else if ( StoreDef[name] === DefPolicy.ONCE )
                proto[name] = value
                
            else 
                proto[name] = wrap(proto[name], value)
        }
        else
            proto[name] = value
    })
}

function merge(a, b){
    if ( typeof a !== typeof b) throw new Error
    else if ( _.isArray(a) )    a.splice(a.length, 0, b)    
    else if ( _.isFunction(a) ) a = wrapMerge(a, b)  
    else                        _.extend(a, b)

    return a
}

function wrap(one, two) {
    return function wrappedMethod(){
        one.apply(this, arguments);
        two.apply(this, arguments)
    }
}

function wrapMerge(one, two) {
    return function wrappedMethod(){
        var r1 = one.apply(this, arguments)
          , r2 = two.apply(this, arguments);

        if( r1 == null ) return r2
        if( r2 == null ) return r1
        else             return _.extend(r1, r2)
    }
}

function mergeActions(ctor, actions){
    ctor.actions = (ctor.actions || []).concat(actions)
}