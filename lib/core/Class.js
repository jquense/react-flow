var _ = require('lodash')
  , Promise = require('bluebird')
  , CoreObject = require('./Object')
  , Trait = require('./Trait')
  , extend = require('../util/extend')
  ;

module.exports = Class = extend(Trait, {

    constructor: function(parent, spec){
        var self = this
          , child;

        Trait.call(this)

        if( arguments.length === 1) {
            spec   = parent
            parent = Object
        }

        child = extend(parent, { constructor: ctor })

        badExtend(child, this)

        child.__target__  = child.prototype
        child.constructor = ctor

        child.mixin(spec)

        return child

        function ctor() {
            var ret = _.has(spec, 'constructor')
                ? spec.constructor.apply(this, arguments)
                : parent.apply(this, arguments)

            Trait.isConflicted(child, true)
            Trait.isResolved(child, true)
            return ret
        }
    },

    finalize: function(){

    }
})


function badExtend(dest, src) {
  if (!dest || !src) return dest;
  for (var field in src) {
    if (dest[field] === src[field] ) continue;
    dest[field] = src[field];
  }
  return dest;
};