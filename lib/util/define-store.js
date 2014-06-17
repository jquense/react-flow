var _ = require('lodash')
  , extend = require('./extend')

module.exports = defineStore

function defineStore(base, def, staticProps) {
    if (arguments.length === 1){
        def = base;
        base = this;
    }

    var proto = _.omit(def, 'actions')
      , actions = base.__actions__ 
          ? _.extend(Object.create(base.__actions__), def.actions) 
          : def.actions
      , store; 

    store = extend(base, proto, staticProps)
    store.__actions__ = actions;

    return store;
};
