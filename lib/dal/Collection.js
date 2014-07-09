var _ = require('lodash')
  , Model = require('./Model')
  , ArrayLike = require('./ArrayLike')
  , extend = require('../util/extend')
  //, sync = require('../util/sync')
  , urlError = require('./urlError')
  , arrayProto = Array.prototype
  , constructor;

constructor = ArrayLike.extend({

    constructor: function Collection(data) {

        ArrayLike.call(this, data)

        Object.defineProperty(this, 'uuid',   arrayPropDesc(_.uniqueId('collection_')))

        this.initialize()
    },

    model: Model,

    initialize: function(){},

    toJSON: function() {
        var json = new Array(this.length)
          , value;

        for (var idx = 0; idx < this.length; idx++){
            value = this[idx];

            if (value instanceof Model) 
                value = value.toJSON();
            
            json[idx] = value;
        }

        return json;
    },

    _createModel: function(item){
        var self = this
          , model = item instanceof this.model
            ? item
            : new this.model(item);

        model.parent = function(){ return self }

        return model;
    },
   
    get: function(item){
        return (item.id != null && this.find(item, { id: item.id })) || this.find(item, { id: item }) || this[this.indexOf(item)]  
    },

    clone: function() {
        return new this.constructor(this.toJSON())
    },

    clear: function() {
        this.splice(0, this.length);
    },

    add: function(items){
        this.push.apply(this, items)
    },

    remove: function(item) {
        this.splice(this.indexOf(item), 1);
    },

    push: function(){
        return arrayProto.push.apply(this, _.map(arguments, this._createModel, this ))
    },

    splice: function(idx, howMany){
        var add = _.map(_.rest(arguments, 2), this._createModel, this )

        return arrayProto.splice.apply(this, [ idx, howMany ].concat(add) )
    },

    unshift: function(){
        return arrayProto.unshift.apply(this, _.map(arguments, this._createModel, this ))
    }
},
//-- Static Convenience methods ---
{
    create: function(def){
        var C = this.extend(def)
        return new C
    },

    of: function(type){
        return this.extend({
            model: type,
            url: type.urlRoot
        })
    }
})

module.exports = constructor

_.each([ 'sortBy', 'groupBy', 'find', 'any'
       , 'without', 'pull', 'findIndex', 'invoke' ], function(method){

    constructor.prototype[method] = function(){
        return _.apply( _, [this].concat(arguments) )
    }
})


function arrayPropDesc(value){
    return { enumerable: false, writable: true, value: value }
}
