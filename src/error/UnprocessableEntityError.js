const HttpError = require('./HttpError')

class UnprocessableEntityError extends HttpError {
  constructor (message) {
    super(message)
    this.statusCode = 422
  }
}

module.exports = UnprocessableEntityError
