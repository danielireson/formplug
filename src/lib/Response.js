class Response {
  constructor (statusCode, message) {
    this.statusCode = statusCode
    this.message = message
  }

  buildJson () {
    let response = {
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

    return Promise.resolve(response)
  }

  buildHtml (template) {
    let response = {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/html'
      },
      body: template.replace('{{ message }}', this.message)
    }

    return Promise.resolve(response)
  }

  buildRedirect (redirectUrl) {
    let response = {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/plain',
        'Location': redirectUrl
      },
      body: this.message
    }

    return Promise.resolve(response)
  }
}

module.exports = Response
