var _ = require('lodash')
  , extend = require('../util/extend')
  , Class = require('../core/Class')
  , BaseStore = require('./BaseStore')
  , Listener = require('../util/ActionListener')

var POLICY = {
    
    actions: function mergeActions(self, target, actions){
        self.actions = (self.actions || []).concat(actions)
    },

}

var StoreFactory = module.exports = new Class(Class, {

    statics: {
        listenFor: function() {
            var types = _.initial(arguments)
              , cb = _.last(arguments);

            if( arguments.length < 2) 
                throw new  TypeError('An Action Listener needs at least one type and a handler')

            return new Listener(types, cb)
        }
    },

    constructor: function Store(spec){
        if ( !(this instanceof Class) )
            return new StoreFactory(spec)

        if ( typeof spec === 'function') 
            throw new Error('stores cannot be inherited from')

        // all stores inherit from BaseStore
        return Class.call(this, BaseStore, spec)
    },

    specPolicy: function(value, key, options) {
        var policy = POLICY[key]

        if (policy ) policy(this, this.__target__, value, options)
        else         this._super.specPolicy.call(this, value, key, options) 
    },

    ignore: function(field, value){
        return this._super.ignore.call(this, field, value) 
            || !!POLICY[field] 
    }
})


