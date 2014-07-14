/* 
*  (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
*  Backbone may be freely distributed under the MIT license.
*  For all details and documentation:
*  http://backbonejs.org
*/

var _ = require('lodash')

module.exports = function extend(parent, protoProps, staticProps) {
    var child;

    if( typeof parent !== 'function'){
        staticProps = protoProps
        protoProps = parent
        parent = this
    }

    child = protoProps && _.has(protoProps, 'constructor')
        ? protoProps.constructor
        : function (){ return parent.apply(this, arguments) }
    
    _.extend(child, parent, staticProps)

    child.prototype = Object.create(parent.prototype)
    child.prototype.constructor = child

    if (protoProps) 
        _.extend(child.prototype, protoProps);

    child._super = child.prototype._super = parent.prototype;
    
    return child;
};


