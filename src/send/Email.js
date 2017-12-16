const Validator = require('../common/Validator')

class Email {
  constructor (senderArn) {
    this.senderArn = senderArn
  }

  build (recipients, userParameters) {
    return this._validateArn()
      .then(() => {
        let email = {
          Source: this._buildSenderSource(),
          Destination: {
            ToAddresses: [recipients.to],
            CcAddresses: recipients.cc,
            BccAddresses: recipients.bcc
          },
          Message: {
            Subject: {
              Data: 'You have a form submission'
            },
            Body: {
              Text: {
                Data: this._buildMessageBody(userParameters) + this._buildMessageFooter()
              }
            }
          }
        }

        return Promise.resolve(email)
      })
  }

  _validateArn () {
    let senderArnAsArray = this.senderArn.split(':')
    let identity = senderArnAsArray.length > 0 ? senderArnAsArray[senderArnAsArray.length - 1] : ''

    if (senderArnAsArray.length !== 6) {
      return Promise.reject(new Error('Sender ARN is formatted incorrectly'))
    }

    if (this.senderArn.substring(0, 3) !== 'arn') {
      return Promise.reject(new Error("Sender ARN should start with 'arn'"))
    }

    if (identity.length < 9) {
      return Promise.reject(new Error('Sender ARN identity length is invalid'))
    }

    if (!Validator.isEmail(identity.substring(9))) {
      return Promise.reject(new Error('Sender ARN identity email address is invalid'))
    }

    return Promise.resolve()
  }

  _buildSenderSource () {
    let senderArnAsArray = this.senderArn.split('/')
    let email = senderArnAsArray[senderArnAsArray.length - 1]
    return `Formplug <${email}>`
  }

  _buildMessageBody (userParameters) {
    return Object.keys(userParameters)
      .filter(function (param) {
        // don't send private variables
        return param.substring(0, 1) !== '_'
      })
      .reduce(function (message, param) {
        // uppercase the field names and add each parameter value
        message += param.toUpperCase() + ': ' + userParameters[param] + '\r\n'
        return message
      }, '')
  }

  _buildMessageFooter () {
    let footer = '---' + '\r\n'
    footer += 'Sent with Formplug'
    return footer
  }
}

module.exports = Email
