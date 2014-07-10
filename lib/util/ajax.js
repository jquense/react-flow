var $ = require('jquery')
  , Promise = require('bluebird')

module.exports = function(options){
    var xhr = $.ajax.call($, options)

    return Promise.cast(xhr)
        .cancellable()
        .caught(Promise.CancellationError, function(e){
            xhr.abort()
            throw e
        })
}