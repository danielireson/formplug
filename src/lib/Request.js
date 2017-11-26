const querystring = require('querystring')

const Validator = require('./Validator')

class Request {
  constructor (event) {
    this.recipients = {
      to: '',
      cc: [],
      bcc: []
    }

    this.pathParameters = event.pathParameters
    this.queryStringParameters = event.queryStringParameters
    this.userParameters = querystring.parse(event.body)
  }

  validate () {
    return Promise.resolve()
      .then(() => this._validateSingleEmails())
      .then(() => this._validateDelimiteredEmails())
  }

  _validateSingleEmails () {
    for (let field of ['_to']) {
      if (field in this.userParameters) {
        let email = this.userParameters[field]
        if (Validator.isEmail(email)) {
          this.recipients[field.substring(1)] = email
        } else {
          return Promise.reject(`Invalid email in '${field}' field`)
        }
      }
    }

    return Promise.resolve()
  }

  _validateDelimiteredEmails () {
    for (let field of ['_cc', '_bcc']) {
      if (field in this.userParameters) {
        let emails = this.userParameters[field].split(';')
        for (let email of emails) {
          if (Validator.isEmail(email)) {
            this.recipients[field.substring(1)].push(email)
          } else {
            return Promise.reject(`Invalid email in '${field}' field`)
          }
        }
      }
    }

    return Promise.resolve()
  }
}

module.exports = Request
