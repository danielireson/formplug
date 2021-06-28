class RedirectResponse {
  constructor(statusCode, message, redirect) {
    this.statusCode = statusCode;
    this.headers = {
      "Content-Type": "text/plain",
      Location: redirect,
    };
    this.body = message;
  }
}

module.exports = RedirectResponse;
