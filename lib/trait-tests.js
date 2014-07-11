var React = require('react')
  , FlowObject = require('react-flow/lib/core/Object')
  , Trait = require('react-flow/lib/core/Trait')


module.exports = (function(){
    var EnumerableTrait, Interval, t3, t4;

    EnumerableTrait = new Trait({

        forEach: Trait.required,

        map: function(fun) {
            var seq = [];
            this.forEach(function(e,i) {
                seq.push(fun(e,i));
            });
            return seq;
        },

        filter: function(pred) {
            var seq = [];
            this.forEach(function(e,i) {
                if (pred(e,i)) {
                    seq.push(e);          
                }
            });
            return seq;
        },

        reduce: function(init, fun) {
            var result = init;
            this.forEach(function(e,i) {
                result = fun(result, e, i);
            });
            return result;
        }
    });

    var ComparableTrait = new Trait({
        '<':  Trait.required, // this['<'](other) -> boolean
        '==': Trait.required, // this['=='](other) -> boolean

        '<=': function(other) {
            return this['<'](other) || this['=='](other);
        },
        '>': function(other) {
            return other['<'](this);
        },
        '>=': function(other) {
            return other['<'](this) || this['=='](other);
        },
        '!=': function(other) {
            return !(this['=='](other));  
        }
    })

    Interval = Trait.compose([
        EnumerableTrait,
        ComparableTrait,
        new Trait(function(){

            return {
                start: Trait.required,
                end:   Trait.required,
                get size(){ return this.end - this.start },
                '<': function(ival) { return this.start <= ival.start; },
                '==': function(ival) { return this.start == ival.start && max == ival.end; },
                toString: function()  { return '' + this.start + '..!' + this.end; },
                contains: function(e) { return ( this.start <= e) && (e <  this.end); },
                forEach: function(consumer) {
                    for (var i = this.start; i < this.end; i++) {
                        consumer( i, i - this.start);
                    }
                }
            }
        })])

    var Obj = FlowObject
      .extend({

          traits: [ Interval ],

          start: 5,

          end: 10
      })

    var obj = new Obj()

   console.log(obj.start, obj.end, obj.reduce(0, function(a,b) { return a+b; }))

    //obj = new Interval

    // trait1 = new Trait({ 
    //     another: Trait.resolutions.chain
    //   },
    //   {
    //     hi: function(){ 
    //       console.log('heelo') 
    //     },
    //     another: function(){ 
    //       console.log('333333') 
    //     }
    //   })

    // trait2 = new Trait({

    //   hi: function(){ 
    //     console.log('hihihihi') 
    //   },

    //   another: function(){ 
    //     console.log('another') 
    //   }
    // })

    // t4 = FlowObject
    //   .extend({

    //       traits: [
    //           trait1
    //         , Trait.resolve(trait2, { hi: Trait.resolutions.chain })
    //         , Trait.resolve(trait2, { actions: Trait.resolutions.merge })
    //         , t3
    //       ],

    //       another: function(){ console.log('hi!') }
    //   })

    // var obj = new t4
   

}());