class HtmlResponse {
  constructor (statusCode, message, template) {
    this.statusCode = statusCode
    this.message = message
    this.template = template
  }

  build () {
    return {
      statusCode: this.statusCode,
      headers: {
        'Content-Type': 'text/html'
      },
      body: this.template.replace(/{{ message }}/g, this.message)
    }
  }
}

module.exports = HtmlResponse
