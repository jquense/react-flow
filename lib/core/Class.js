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

        constructor: function Class(parent, spec, /* internal */ options){
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

            child = this._prepare(spec, parent)

            child.__target__ = (options || {}).target || child.prototype
            child.mixin(TObject)
            child.mixin(spec)

            return child
        },

        _prepare: function(spec, parent) {
            var child;

            child = spec && _.has(spec, 'constructor')
                ? spec.constructor
                : function (){ return apply(parent, this, arguments) }

            _.extend(child, parent)
            badExtend(child, this)

            child._super = parent
            child.constructor = child
            child.prototype   = Object.create(parent.prototype)
            child.prototype._super = parent.prototype;
            return child            
        }

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