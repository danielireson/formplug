class RedirectResponse {
  constructor (statusCode, message, redirectUrl) {
    this.statusCode = statusCode
    this.message = message
    this.redirectUrl = redirectUrl
  }

  build () {
    return {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/plain',
        'Location': this.redirectUrl
      },
      body: this.message
    }
  }
}

module.exports = RedirectResponse
