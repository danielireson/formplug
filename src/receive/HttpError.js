class HttpError {
  badRequest (message) {
    return this._buildError(400, message)
  }

  forbidden (message) {
    return this._buildError(403, message)
  }

  notFound (message) {
    return this._buildError(404, message)
  }

  unprocessableEntity (message) {
    return this._buildError(422, message)
  }

  internalServerError (message) {
    return this._buildError(500, message)
  }

  badGateway (message) {
    return this._buildError(502, message)
  }

  _buildError (statusCode, message) {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
  }
}

module.exports = HttpError
