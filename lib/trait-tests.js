var React = require('react')
  , FlowObject = require('react-flow/lib/core/Object')
  , Class = require('react-flow/lib/core/Class')
  , Trait = require('react-flow/lib/core/Trait')
  , compose = require('react-flow/lib/core/compose')



module.exports = function(Class2){

    var TraitA = new Trait({

        speak: function(){
            console.log('traitA')
        }
    })

    var TraitB = new Trait({
        
        greeting: compose.required,

        speak: function(){
            console.log(this.greeting)
        }
    })

    var TraitC = new Trait({

        include: TraitB,

        greeting: 'traitB',

        speak: compose.merge(function(){
            console.log('traitC')
        })
    })

    var Foo = new Class({

        include: [
              TraitA
            , TraitC
        ],

        speak: compose.after(TraitC, function() {
            console.log('and in class Foo');
        }),

        hello: function(){
            console.log('and in class Foo');
        }
    });

    // var Bar = new Class(Foo, {
    //     include: new Trait({

    //         speak: function(){
    //             console.log('foo! traitA')
    //         }
    //     }),

    //     speak: compose.after(function(){
    //         console.log(' and in class Bar');
    //         this._super.speak.call(this)
    //     })
    // })
    // Foo.mixin({ 
    //     speak: compose.around(function(orginal){
    //         console.log('in the mixin start');
    //         orginal.call(this)
    //         console.log('in the mixin end');
    //     }) 
    // })
    var foo = new Foo()
      //, bar = new Bar()

    foo.speak()
    //foo.hello()
};