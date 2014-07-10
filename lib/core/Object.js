var _ = require('lodash')
  , Promise = require('bluebird')
  , extend = require('../util/extend');

module.exports = make()

function make(){
    var instProps;

    function Obj() {
        _.extend(this, instProps)
        instProps = null
    }

    Obj.create = function(){
        if( arguments.length > 0) instProps = arguments
        return new this
    }

    Obj.extend = extend

    Obj.mixInto = function(props){
        _.extend(this.prototype, props)
    }

    return obj
}


