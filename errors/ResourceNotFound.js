// snippet taken from https://gist.github.com/justmoon/15511f92e5216fa2624b
module.exports = function ResourceNotFound(message) {
  Error.captureStackTrace(this, this.constructor)
  this.message = message
}

require('util').inherits(module.exports, Error)
