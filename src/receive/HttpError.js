class HttpError {
  constructor () {
    this.internalServerError('An unexpected error occurred')
  }

  badRequest (message) {
    this.statusCode = 400
    this.message = message
    return this
  }

  forbidden (message) {
    this.statusCode = 403
    this.message = message
    return this
  }

  notFound (message) {
    this.statusCode = 404
    this.message = message
    return this
  }

  unprocessableEntity (message) {
    this.statusCode = 422
    this.message = message
    return this
  }

  internalServerError (message) {
    this.statusCode = 500
    this.message = message
    return this
  }

  badGateway (message) {
    this.statusCode = 502
    this.message = message
    return this
  }
}

module.exports = HttpError
