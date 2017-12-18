const querystring = require('querystring')

const HttpError = require('./HttpError')
const Validator = require('../common/Validator')

class Request {
  constructor (event, encrypter) {
    this.singleEmailFields = ['_to']
    this.delimeteredEmailFields = ['_cc', '_bcc', '_replyTo']
    this.recipients = {
      to: '',
      cc: [],
      bcc: [],
      replyTo: []
    }

    this.responseFormat = 'html'
    this.redirectUrl = null

    this.pathParameters = event.pathParameters || {}
    this.queryStringParameters = event.queryStringParameters || {}
    this.userParameters = querystring.parse(event.body)
    this.encrypter = encrypter
  }

  validate () {
    return Promise.resolve()
      .then(() => this._validateResponseFormat())
      .then(() => this._validateNoHoneyPot())
      .then(() => this._validateSingleEmails())
      .then(() => this._validateDelimiteredEmails())
      .then(() => this._validateToRecipient())
      .then(() => this._validateRedirect())
  }

  _validateResponseFormat () {
    if ('format' in this.queryStringParameters) {
      if (this.queryStringParameters.format !== 'json' && this.queryStringParameters.format !== 'html') {
        return Promise.reject(new HttpError().unprocessableEntity('Invalid response format in the query string'))
      } else {
        this.responseFormat = this.queryStringParameters.format
      }
    }

    return Promise.resolve()
  }

  _validateNoHoneyPot () {
    if ('_honeypot' in this.userParameters && this.userParameters._honeypot !== '') {
      return Promise.reject(new HttpError().forbidden('You shall not pass'))
    }

    return Promise.resolve()
  }

  _validateToRecipient () {
    if (this.recipients.to === '') {
      return Promise.reject(new HttpError().unprocessableEntity("Please provide a recipient in '_to' field"))
    }
  }

  _validateSingleEmails () {
    return new Promise((resolve, reject) => {
      this.singleEmailFields
        .filter((field) => field in this.userParameters)
        .forEach((field) => {
          let input = this.userParameters[field]
          if (!this._parseEmail(input, field)) {
            return reject(new HttpError().unprocessableEntity(`Invalid email in '${field}' field`))
          }
        })

      return resolve()
    })
  }

  _validateDelimiteredEmails () {
    return new Promise((resolve, reject) => {
      this.delimeteredEmailFields
        .filter((field) => field in this.userParameters)
        .forEach((field) => {
          let inputs = this.userParameters[field].split(';')
          inputs.forEach((input) => {
            if (!this._parseEmail(input, field)) {
              return reject(new HttpError().unprocessableEntity(`Invalid email in '${field}' field`))
            }
          })
        })

      return resolve()
    })
  }

  _validateRedirect () {
    if ('_redirect' in this.userParameters) {
      if (!Validator.isWebsite(this.userParameters['_redirect'])) {
        return Promise.reject(new HttpError().unprocessableEntity("Invalid website URL in '_redirect'"))
      } else {
        this.responseFormat = 'plain'
        this.redirectUrl = this.userParameters['_redirect']
      }
    }

    return Promise.resolve()
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
