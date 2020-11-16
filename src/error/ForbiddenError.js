const HttpError = require("./HttpError");

class ForbiddenError extends HttpError {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;
