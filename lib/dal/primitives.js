"use strict"
var _ = require('lodash');

module.exports = {
    isPrimative: function(ctor){
         return _.any([ String, Boolean, Number, Date ], ctor)
    },
    getPrimitiveParser: function(ctor){
        if ( ctor === Number ) 
            return parsers[0]
        else if ( ctor === Date ) 
            return parsers[1]
        else if ( ctor === Boolean ) 
            return parsers[2]
        else if ( ctor === String ) 
            return parsers[3]
    }
}

var parsers = {
    0: function (value) {
        return parseFloat(value);
    },

    1: function (value) {
        return new Date(value)
    },

    2: function (value) {
        if (typeof value === 'string') 
            return value.toLowerCase() === "true";

        return value != null ? !!value : value;
    },

    3: function (value) {
        return value != null ? (value + "") : value;
    }
}


