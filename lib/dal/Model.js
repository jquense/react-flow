var _ = require('lodash')
  , Promise = require('bluebird')
  , Field = require('./Field')
  , extend = require('../util/extend')
  //, sync = require('../util/sync')  
  , urlError = require('./urlError')
  , idDescriptor = {
        get : function(){ return this[this.idField]; },
        set : function(value){   this[this.idField] = value },
        enumerable : true
   };

module.exports = Model

function Model(data) {
    var self = this
      , fields = self._fields || {}
      , proxy = _.transform(this._fields || {}, function(d, field, key){
            d[key] = ('defaultValue' in field) 
                ? field.defaultValue
                : null;
      });
 
    this.uuid = _.uniqueId('model_');

    Object.defineProperties(self, _.mapValues(fields, _.partial(getDescriptor, proxy) ));

    _.extend(this, data);

    if (self.idField && self.idField !== 'id') 
        Object.defineProperty(self, "id", idDescriptor);
}

_.extend(Model.prototype , {

    idField: 'id',
   
    isNew: function() {
        return !this.id;
    },

    parent: _.noop,

    toJSON: function(options){
        var self = this
          , fields = self._fields || {};

        options || (options = {})

        return _.transform(this, function(json, val, key){
            var field = fields[key]

            if( key === 'id' && options.id === true )
                json[key] = val;

            else if( field && field.serialize !== false )
                json[key] = val
        })
    },

    url: function() {
        var base =
            _.result(this, 'urlRoot')      ||
            _.result(this.parent(), 'url') ||
            urlError();


        if (this.isNew()) return base;
        return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

	// fetch: function (options) {
 //        var self = this;

 //        return sync('read', self, options)
 //            .then(function (data) {
 //                _.extend(self, _.mapValues(data, self._parse, self)) 
 //            });
 //    },

 //    save: function (options) {
 //        var self = this;

 //        return sync(self.isNew() ? 'create' : 'update', self, options)
 //            .then(function (data) {
 //                _.extend(self, _.mapValues(data, self._parse, self)) 
 //            });
 //    },

 //    destroy: function (options) {
 //        return sync('delete', this, options);
 //    },

    clone: function() {
        return new this.constructor(this.toJSON())
    } 
})


Model.define = function(base, options) {
    var proto = {}
      , fields = {}
      , hasFields = false
      , model, field;

    if (arguments.length === 1) {
        options = base;
        base = Model;
    }

    for (name in options) {
        field = options[name]

        if ( field instanceof Field) {
            hasFields = true
            fields[name] = field
        } else
            proto[name] = field
    } 

    if ( hasFields) 
        proto._fields = fields

    model = extend(base, proto);   
    model.define = function(options) {
        return Model.define(model, options);
    };

    return model
}

Model.field = Field.create

Model.distinctBy = function(idField){
    return this.define({
        idField: idField
    })
} 

Model.create = function(def){
    var M = this.define(def)
    return new M
}


function getDescriptor(proxy, field, key ) {
    return {
        enumerable:   _.isBoolean(field.enumerable) ? field.enumerable : true,
        configurable: _.isBoolean(field.configurable) ? field.configurable : true,
        get: function(){ 
            return proxy[key] 
        },
        set: function(val){
            
            if ( val instanceof field.ctor )
                proxy[key] = val
            else if( field.parse)
                proxy[key] = field.parse(val)
            else
                throw TypeError('field: ' + key + 'incorrect type and no parser')
        },
    }
}