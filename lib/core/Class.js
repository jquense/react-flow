var _ = require('lodash')
  , Promise = require('bluebird')
  , CoreObject = require('./Object')
  , Trait = require('./Trait')
  , extend = require('../util/extend')
  , apply = require('../util/apply')
  ;


module.exports = Class = (function() {
    var initProps
      , TObject = {

        statics: {
            create: function(){
                initProps = _.toArray(arguments)
                return new this
            },
        }
    };

    return extend(Trait, {

        initialize: _.noop,

        constructor: function Class(parent, spec){
            var self = this
              , child;

            
            Trait.call(this)

            if( arguments.length === 1) {
                spec   = parent
                parent = function FlowObject() {
                    var props = initProps

                    initProps = null;

                    Trait.assertResolved(child)
                    Trait.assertFullfilled(child)

                    props && apply(_.extend, _, [ this ].concat(props))

                    this.initialize && apply(this.initialize, this, arguments)
                }
            }

            child = spec && _.has(spec, 'constructor')
                ? spec.constructor
                : function (){ return apply(parent, this, arguments) }

            _.extend(child, parent)
            badExtend(child, this)

            child.__target__ = Object.create(parent.prototype)
            
            child.mixin(TObject)
            child.mixin(spec)
            
            child.constructor = child
            child.prototype   = child.__target__
            child.prototype._super = parent.prototype;

            return child
        },

    })

    

}());
// function meta(self){
//    return self.__meta__ || (self.__meta__ = new Trait(undefined, { target: self }))
// }

function badExtend(dest, src) {
  if (!dest || !src) return dest;
  for (var field in src) {
    if (dest[field] === src[field] ) continue;
    dest[field] = src[field];
  }
  return dest;
};