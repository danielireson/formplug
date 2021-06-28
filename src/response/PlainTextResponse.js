class PlainTextResponse {
  constructor(statusCode, message) {
    this.statusCode = statusCode;
    this.headers = {
      "Content-Type": "text/plain",
    };
    this.body = message;
  }
}

module.exports = PlainTextResponse;
