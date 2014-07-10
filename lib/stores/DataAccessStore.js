var defineStore  = require('./define-store')
  , listenFor    = defineStore.listenFor
  , Collection   = require('../dal/Collection')
  , Url          = require('url')
  , Promise      = require('bluebird')
  , _            = require('lodash')
  , appConstants = require('../constants/appConstants')
  , sync         = require('../util/sync')
  , typeMap      = {};

module.exports = defineStore({

   actions: [

        listenFor(appConstants.START, function(options){
            this._extend(options)
        }),

        listenFor('dal_register', function(key, type){

        }),

        listenFor('dal_model_save', function(key, type){
            
        })

    ],

    createRecord: function(type, data){
        var model = modelTypeFor(type)

        model = new model
        model.accept(data)

        return model
    },

    find: function(type, id){
        var record = this.recordForId(type)
        
        return record;
    },

    all: function(type){
        var self = this
          , records = this.recordsFor(type);

        if ( records && records.length ) return Promise.resolve(records)

        return sync('read', records, {})
            .then(self._pushMany.bind(this, type));
    },

    recordForId: function(type, id){
        var records = this.recordsFor(type)
          , record  = records.find({ id: id });

        if ( record ) return Promise.resolve(record)

        record = this.createRecord(type, { id : id })

        return sync('read', record, {})
            .then(self._push.bind(this, type));
    },

    modelTypeFor: function(type){
        var record = this.container.factoryFor('model:' + type)

        record.__type__ = type;

        return record
    },

    recordsFor: function(type){
        var records = typeMap[type]

        return typeMap[type] = (records || collectionFor(this, type))
    },

    url: function(model){
        var url = _.result(model.url);

        return url;
    },

    _push: function(type, data){
        var records = this.recordsFor(type)
          , model   = this.modelTypeFor(type)

        model = new model
        model.accept(data)
        
        records.push(model)

        return model
    },

    _pushMany: function(type, data){
        var self = this;

        return _.map(data, function(datum){
            return self._push(type, datum)
        })
    }
})

function collectionFor(self, type){
    var model = self.modelTypeFor(type)
      , factory = self.container.factoryFor('collection:' + type);

    if ( !factory) 
        self.container.register('collection:' + type, Collection.of(model) )

    return self.container.resolve('collection:' + type)
}