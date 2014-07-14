var React = require('react')
  , FlowObject = require('react-flow/lib/core/Object')
  , Class = require('react-flow/lib/core/Class')
  , Trait = require('react-flow/lib/core/Trait')
  , compose = require('react-flow/lib/core/compose')



module.exports = function(Class2){

    var StoreFactory = new Class(Class, {

        constructor: function(spec){
            Class.call(this, spec)
        },

        ignore: function(field, value){
            return this._super.ignore.call(this, field, value) 
                || field === 'butts'
        }
    })

    var store = new StoreFactory({
        butts: 'hi',
        not_butts: 'also hi'
    })

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

        //TraitA, TraitB, 
        speak: compose.after(function() {
            console.log(' and in class Foo');
        })
    });

    var Bar = new Class(Foo, {
        include: new Trait({

            speak: function(){
                console.log('foo! traitA')
            }
        }),

        speak: compose.after(function(){
            console.log(' and in class Bar');
            this._super.speak.call(this)
        })
    })

    var foo = new Foo()
      , bar = new Bar()

    bar.speak()

};