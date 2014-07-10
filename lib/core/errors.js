var _ = require('lodash')

module.exports.TraitConflictError = TraitConflictError;
function TraitConflictError(message) {
        this.name = "TraitConflictError";
        this.message = _.isArray(message)
            ? message.join('::')
            : message;

        Error.captureStackTrace(this, TraitConflictError);
    }

TraitConflictError.prototype = Object.create(Error.prototype);
TraitConflictError.prototype.constructor = TraitConflictError;