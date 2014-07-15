var _ = require('lodash')
  , Promise = require('bluebird')
  , Field = require('./Field')
  , extend = require('../util/extend')
  , urlError = require('../core/urlError')
  , idDescriptor = {
        get : function(){ return this[this.idField]; },
        set : function(value){   this[this.idField] = value },
        enumerable : true
   };

module.exports = Model

function Model() {
    var self = this
      , fields = self._fields || {}
      , proxy = _.transform(this._fields || {}, function(d, field, key){
            d[key] = ('defaultValue' in field) 
                ? field.defaultValue
                : null;
      });
 
    this.uuid   = _.uniqueId('model_')
    this.commit = _.bind(this.commit, this, proxy)
    this.revert = _.bind(this.revert, this, proxy)

    proxy.__changes__ = {}

    Object.defineProperty(self, 'dirty', {
        get: function(){ return _.size(proxy.__changes__) > 0 },
        set: function(val) { if ( val === false) this.commit() },
        enumerable : false
    })

    Object.defineProperties(self, _.mapValues(fields, _.partial(getDescriptor, proxy) ))

    if (self.idField && self.idField !== 'id') 
        Object.defineProperty(self, "id", idDescriptor);
}

_.extend(Model.prototype , {

    initialize: function(){},

    idField: 'id',
   
    isNew: function() {
        return !this.id;
    },

    parent: _.noop,

    accept: function(data){
        _.extend(this, data)
        this.commit();
    },

    revert: function(proxy){
        _.assign(this, proxy.__changes__);
        this.commit();
    },

    commit: function(proxy){
        proxy.__changes__ = {};
    },

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


Model.define = Model.extend = function(options) {
    var base = this
      , proto = {}
      , fields = {}
      , hasFields = false
      , model, field;

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

    model = extend(base, proto)

    model.urlRoot = proto.urlRoot
    model.url = proto.url || base.url

    // model.define = model.extend = function(options) {
    //     return Model.define(model, options);
    // };

    return model
}


Model.distinctBy = function(idField){
    return this.extend({
        idField: idField
    })
} 

Model.create = function(def){
    var M = this.extend(def)
    return new M
}

Model.url = Model.prototype.url


function getDescriptor(proxy, field, key ) {

    return {
        enumerable:   _.isBoolean(field.enumerable) ? field.enumerable : true,
        configurable: _.isBoolean(field.configurable) ? field.configurable : true,
        get: function(){ 
            return proxy[key] 
        },
        set: function(val){
            var last = proxy[key]

            if ( val instanceof field.ctor )
                proxy[key] = val
            else if( field.parse)
                proxy[key] = field.parse(val)
            else
                throw TypeError('field: ' + key + 'incorrect type and no parser')

            if( !_.has(proxy.__changes__, key) )
                proxy.__changes__[key] = last
        },
    }
}