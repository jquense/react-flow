var _ = require('lodash')
  , Promise = require('bluebird');

var _stores = {}
  , _deferreds = {}
  , _waits = {}
  , dispatching = null;

module.exports = {

    register: function(store, callback) {
        var name = getName(store)
        if (_.has(_stores, name) )
            throw new Error('Store: "'+ name + '" already registered with Dispatcher')

        _stores[name] = callback;
    },

    dispatch: function(payload) {
        if ( dispatching ) throw new TypeError('Cannot dispatch "'+ payload.action + '" until "'+ dispatching + '" is finished')
        else if (!_.has(payload, 'action')) throw new TypeError('Action payload must have an Action property')
        else if (!_.has(payload, 'data')  ) throw new TypeError('Action payload must have an Data property')

        dispatching = payload.action;

        _deferreds = toDeferreds();
  
        _.each(_stores, function(store, key) {
            var d = _deferreds[key]

            try{
                Promise
                    .cast(store(payload))
                    .then(function(){
                        d.resolve(payload)
                    },
                    function(err){
                        d.reject(err)
                    })
            } catch(err){
                d.reject(err)
            }
        });

        _deferreds = {}
        _waits = {}
        dispatching = null
    },

    waitFor: function(callee, stores) {
        var calleeName = getName(callee);

        stores = [].concat(stores);

        if (!_.has(_stores, calleeName) )         throw new Error('Calling store is not registered with the Dispatcher')
        else if ( _.has(_waits, calleeName) )     throw new Error('Store: "' + calleeName + '" already waiting')
        else if ( _.contains(stores, calleeName)) throw new Error('Calling store cannot wait on itself')
        
        _waits[calleeName] = stores;

        return Promise.map(stores, function(name){
            cirularwait = ( _waits[name] || [] ).indexOf(calleeName)!== -1;

            if (!_.has(_stores, name) ) 
                throw new Error('Store: "' + calleeName + '" attempting to wait on a non-registered Store:"'+ name + '"')

            else if ( cirularwait ) 
                throw new Error('Circular wait attempted between: "' + calleeName + '" and "'+ name + '"')

            return _deferreds[name].promise;
        })
        .then(function(){
            console.log('hi')
        });
    }
};


function getName(store){
    return store.id // || store.constructor.name;
}

function toDeferreds(){
    return _.mapValues(_stores, function() {
        var d = {}
        
        d.promise = new Promise(function(resolve, reject){ 
            d.resolve = resolve
            d.reject  = reject
        })

        return d
    });
}
