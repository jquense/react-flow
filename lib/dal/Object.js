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

module.exports = make()

function make(){
    var instProps;

    function Obj() {
        _.extend(this, instProps)
    }

    Obj.create = function(){
        if( arguments.length > 0) instProps = arguments
        return new this
    }
}


