class RedirectResponse {
  constructor(statusCode, message, redirect) {
    this.statusCode = statusCode;
    this.message = message;
    this.redirect = redirect;
  }

  build() {
    return {
      statusCode: this.statusCode,
      headers: {
        "Content-Type": "text/plain",
        Location: this.redirect,
      },
      body: this.message,
    };
  }
}

module.exports = RedirectResponse;
