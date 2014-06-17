var _ = require('lodash')

module.exports = function extend(parent, protoProps, staticProps) {
    var child;

    if( typeof parent !== 'function'){
        staticProps = protoProps
        protoProps = base
        parent = this
    }

    child = protoProps && _.has(protoProps, 'constructor')
        ? protoProps.constructor
        : function (){ return parent.apply(this, arguments); };
    
    _.extend(child, parent, staticProps);

    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) _.extend(child.prototype, protoProps);

    return child;
};


