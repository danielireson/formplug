const HttpError = require("./HttpError");

class BadRequestError extends HttpError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
