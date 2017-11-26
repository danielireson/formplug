const querystring = require('querystring')

class Request {
  constructor (event) {
    this.pathParameters = event.pathParameters
    this.queryStringParameters = event.queryStringParameters
    this.userParameters = querystring.parse(event.body)
  }
}

module.exports = Request
