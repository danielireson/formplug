const querystring = require('querystring')

const Validator = require('../common/Validator')

class Request {
  constructor (event, encrypter) {
    this.responseFormat = 'html'
    this.singleEmailFields = ['_to']
    this.delimeteredEmailFields = ['_cc', '_bcc']
    this.recipients = {
      to: '',
      cc: [],
      bcc: []
    }

    this.pathParameters = event.pathParameters
    this.queryStringParameters = event.queryStringParameters
    this.userParameters = querystring.parse(event.body)
    this.encrypter = encrypter
  }

  validate () {
    return Promise.resolve()
      .then(() => this._validateNoHoneyPot())
      .then(() => this._validateSingleEmails())
      .then(() => this._validateDelimiteredEmails())
      .then(() => this._validateResponseFormat())
  }

  _validateNoHoneyPot () {
    if ('_honeypot' in this.userParameters && this.userParameters._honeypot !== '') {
      return Promise.reject(new Error('You shall not pass'))
    }

    return Promise.resolve()
  }

  _validateSingleEmails () {
    for (let field of this.singleEmailFields) {
      if (field in this.userParameters) {
        let input = this.userParameters[field]
        if (!this._parseEmail(input, field)) {
          return Promise.reject(new Error(`Invalid email in '${field}' field`))
        }
      }
    }

    return Promise.resolve()
  }

  _validateDelimiteredEmails () {
    for (let field of this.delimeteredEmailFields) {
      if (field in this.userParameters) {
        let inputs = this.userParameters[field].split(';')
        for (let input of inputs) {
          if (!this._parseEmail(input, field)) {
            return Promise.reject(new Error(`Invalid email in '${field}' field`))
          }
        }
      }
    }

    return Promise.resolve()
  }

  _validateResponseFormat () {
    if ('format' in this.queryStringParameters) {
      if (this.queryStringParameters.format === 'json' || this.queryStringParameters.format === 'html') {
        this.responseFormat = this.queryStringParameters.format
        return Promise.resolve()
      } else {
        return Promise.reject(new Error('Invalid response format in the query string'))
      }
    }
  }

  _parseEmail (input, field) {
    // check for plain text email addresses
    if (Validator.isEmail(input)) {
      this._addEmail(input, field)
      return true
    }

    // check for encrypted email addresses
    let inputDecrypted = this.encrypter.decrypt(input)
    if (Validator.isEmail(inputDecrypted)) {
      this._addEmail(inputDecrypted, field)
      return true
    }
  }

  _addEmail (email, field) {
    if (this.delimeteredEmailFields.indexOf(field) === -1) {
      this.recipients[field.substring(1)] = email
    } else {
      this.recipients[field.substring(1)].push(email)
    }
  }
}

module.exports = Request
