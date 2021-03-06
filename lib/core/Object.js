var _ = require('lodash')
  , Promise = require('bluebird')
  , Trait = require('./Trait')
  , extend = require('../util/extend');

var RESERVED = {

    traits: function(ctor, traits){
        traits = [].concat(traits)

        if (ctor.prototype.traits )
            traits.push(ctor.prototype.traits) 

        ctor.prototype.traits = Trait.compose(traits)
    }
}

module.exports = make()

function make(){
    var instProps;

    function FlowObject(spec) {
        var self = this
          , props = instProps  || {};

        instProps = null 
        this.mixIn(props)
        this.mixIn(spec || {}) 
    }

    FlowObject.prototype = {}

    FlowObject.create = function(){
        if( arguments.length > 0) instProps = arguments
        return new this
    }

    // FlowObject.prototype = {

    // }
    // // FlowObject.create = function(){
    // //     if( arguments.length > 0) instProps = arguments
    // //     return new this
    // // }

    // FlowObject.extend = function (spec, staticProps) {
    //     var parent = this
    //       , child;

    //     child = spec && _.has(spec, 'constructor')
    //         ? spec.constructor
    //         : function (){ return parent.apply(this, arguments); };

    //     child.prototype = Object.create(parent.prototype)
    //     child.prototype.constructor = child;

    //     mixInto(child, spec || {})
    //     Trait.composeInto(child.prototype, spec.traits)
    //     return child
    // }

    // FlowObject.using = function(traits){
    //     Trait.composeInto(this.prototype, traits)
    // }

    //return FlowObject
}

function mixInto(ctor, spec){
    var proto = ctor.prototype;

    _.each(spec, function(value, name){
        if( _.has(RESERVED, name) )
            RESERVED[name](ctor, value)
        else
            proto[name] = value
    })
}
