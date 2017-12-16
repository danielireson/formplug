class Response {
  constructor (statusCode, message) {
    this.statusCode = statusCode
    this.message = message
  }

  buildJson () {
    return {
      statusCode: this.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        statusCode: this.statusCode,
        message: this.message
      })
    }
  }

  buildHtml (template) {
    return {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/html'
      },
      body: template.replace('{{ message }}', this.message)
    }
  }

  buildRedirect (redirectUrl) {
    return {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/plain',
        'Location': redirectUrl
      },
      body: this.message
    }
  }
}

module.exports = Response
