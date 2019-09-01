class PlainTextResponse {
  constructor (statusCode, message) {
    this.statusCode = statusCode
    this.message = message
  }

  build () {
    return {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: this.message
    }
  }
}

module.exports = PlainTextResponse
