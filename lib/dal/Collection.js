var _ = require('lodash')
  , Model = require('./Model')
  , extend = require('../util/extend')
  //, sync = require('../util/sync')
  , urlError = require('./urlError')
  , arrayProto = Array.prototype;

module.exports = Collection

function Collection(data) {
    var self = this;

    data || (data = [] )

    Object.defineProperty(this, 'length', arrayPropDesc(data.length))
    Object.defineProperty(this, 'uuid',   arrayPropDesc(_.uniqueId('collection_')))

    self.add(data)
}

_.extend(Collection.prototype, {
 
    model: Model,

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
})



_.each([ 'pop', 'slice', 'shift', 'join'], function(method){
    Collection.prototype[method] = function(){
        arrayProto[method].apply(this, arguments)
    }
})

_.each([ 'map', 'filter', 'reduce', 'sortBy', 'groupBy', 'forEach', 'every'
       , 'indexOf', 'find', 'any', 'without', 'pull', 'findIndex', 'some', 'invoke' ], function(method){

    Collection.prototype[method] = function(){
        return _.apply( _, [this].concat(arguments) )
    }
})

//-- Static Convenience methods ---

Collection.create = function(def){
    var C = this.extend(def)
    return new C
}

Collection.extend = extend;

Collection.of = function(type){
    return this.extend({
        model: type
    })
}


function arrayPropDesc(value){
    return { enumerable: false, writable: true, value: value }
}
