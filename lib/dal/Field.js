var _ = require('lodash')
  , primitives = require('./primitives');

module.exports = Field;

function Field(def) {
    _.extend(this, def)
}

Field.create = function(type, options){
    var isArrayOfTypes = _.isArray(type) && type.length
      , def = {}
      , constructor;

    options || (options = {})

    constructor = isArrayOfTypes && type[0] || type

    if (typeof constructor !== 'function' )
        throw TypeError('Field types must be constructors not instances')

    if (!options.nullable) {
        def.defaultValue = options.defaultValue !== undefined 
            ? options.defaultValue 
            : isArrayOfTypes 
                ? []
                : valueOf(new constructor)
    }

    def.ctor  = constructor
    def.parse = getParser(options, constructor, isArrayOfTypes)

    return new Field(def)
}


function getParser(options, constructor, isArrayOfTypes){
    var parser  = options.parse || primitives.getPrimitiveParser(constructor)
      , parse   = function (d){ 
          var ctor = constructor;

          if (d instanceof ctor) return d
          return valueOf(d == null ? new ctor : new ctor(d))
      };

    if (parser) return parser

    if ( !isArrayOfTypes ) return parse

    return parseArray
    
    function parseArray(d){
        return _.map(d, parse) 
    }
}

function valueOf(inst){
    if( inst.valueOf ) inst = inst.valueOf();
    return inst
}