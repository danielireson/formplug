const querystring = require('querystring')

const ForbiddenError = require('../error/ForbiddenError')
const UnprocessableEntityError = require('../error/UnprocessableEntityError')

const encryption = require('../utils/encryption')
const validation = require('../utils/validation')

const SINGLE_EMAIL_FIELDS = ['_to']
const DELIMETERED_EMAIL_FIELDS = ['_cc', '_bcc', '_replyTo']

class Request {
  constructor (event, encryptionKey) {
    this.userParameters = querystring.parse(event.body)
    this.recipients = this._buildRecipients(this.userParameters, encryptionKey)
    this.responseFormat = this._buildResponseFormat(event.queryStringParameters)
    this.redirectUrl = this._buildRedirectUrl(this.userParameters)
  }

  validate () {
    if ('_honeypot' in this.userParameters && this.userParameters._honeypot !== '') {
      return new ForbiddenError()
    }

    if (this.responseFormat !== 'json' && this.responseFormat !== 'html') {
      return new UnprocessableEntityError('Invalid response format in the query string')
    }

    if (this.recipients.to === '') {
      return new UnprocessableEntityError("Invalid '_to' recipient")
    }

    const invalidSingleEmailField = SINGLE_EMAIL_FIELDS.find(field => {
      if (field in this.userParameters) {
        return !validation.isEmail(this.recipients[field.substring(1)])
      } else {
        return false
      }
    })

    if (invalidSingleEmailField) {
      return new UnprocessableEntityError(`Invalid email in '${invalidSingleEmailField}' field`)
    }

    const invalidDelimeteredEmailField = DELIMETERED_EMAIL_FIELDS.find(field => {
      if (field in this.userParameters) {
        return this.recipients[field.substring(1)].some(e => !validation.isEmail(e))
      } else {
        return false
      }
    })

    if (invalidDelimeteredEmailField) {
      return new UnprocessableEntityError(`Invalid email in '${invalidDelimeteredEmailField}' field`)
    }

    if (this.redirectUrl && !validation.isWebsite(this.redirectUrl)) {
      return new UnprocessableEntityError("Invalid website URL in '_redirect'")
    }
  }

  _buildRecipients (userParameters, encryptionKey) {
    const recipients = {
      to: '',
      cc: [],
      bcc: [],
      replyTo: []
    }

    SINGLE_EMAIL_FIELDS.forEach(field => {
      if (field in userParameters) {
        const potentialEmail = userParameters[field]

        if (validation.isEmail(potentialEmail)) {
          recipients[field.substring(1)] = potentialEmail
        } else {
          const decryptedPotentialEmail = encryption.decrypt(potentialEmail, encryptionKey)
          recipients[field.substring(1)] = decryptedPotentialEmail
        }
      }
    })

    DELIMETERED_EMAIL_FIELDS.forEach(field => {
      if (field in userParameters) {
        const potentialEmails = userParameters[field].split(';')

        potentialEmails.forEach(potentialEmail => {
          if (validation.isEmail(potentialEmail)) {
            recipients[field.substring(1)].push(potentialEmail)
          } else {
            const decryptedPotentialEmail = encryption.decrypt(potentialEmail, encryptionKey)
            recipients[field.substring(1)].push(decryptedPotentialEmail)
          }
        })
      }
    })

    return recipients
  }

  _buildResponseFormat (params) {
    if (params && 'format' in params) {
      return params.format
    } else {
      return 'html'
    }
  }

  _buildRedirectUrl (params) {
    if (params && '_redirect' in params) {
      return params['_redirect']
    } else {
      return null
    }
  }
}

module.exports = Request
