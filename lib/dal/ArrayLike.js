var _ = require('lodash')
  , extend = require('../util/extend')
  , arrayProto = Array.prototype;

module.exports = ArrayLike

ArrayLike.extend = extend;

function ArrayLike(data) {
    var self = this
      , len = 0;

    data || (data = [] )

    Object.defineProperty(this, 'length', { 
        enumerable: false, 
        writable: true, 
        value: len = data.length,
        get: function(){ return len },
        set: function(length){
            var old = len
              , dif = Math.abs(length - old)

            len = length

            if ( length < 0 ) throw new RangeError('Invalid array length')
            else if ( length === 0 && old > 0 ) self.splice(0, old)
            else if ( length > old) self.push.apply(self, emptyRange(dif))
            else if ( length < old) self.splice(old - dif, dif)
            return len
        }
    })

    self.add(data)
}

_.each([ 'pop', 'slice', 'shift', 'join', 'unshift', 'splice', 'push' ], function(method){
    ArrayLike.prototype[method] = function(){
        arrayProto[method].apply(this, arguments)
    }
})

_.each([ 'map', 'filter', 'reduce', 'forEach', 'every'
       , 'indexOf', 'some' ], function(method){

    ArrayLike.prototype[method] = function(){
        return _.apply( _, [this].concat(arguments) )
    }
})


function emptyRange(count){
    return _.map(_.range(count), function(){})
}