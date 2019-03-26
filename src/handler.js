const fs = require('fs')
const path = require('path')

const Email = require('./http/Email')
const Encrypter = require('./common/Encrypter')
const Log = require('./common/Log')
const Request = require('./http/Request')
const Response = require('./http/Response')
const Validator = require('./common/Validator')

const emailService = require('./services/EmailService')
const configService = require('./services/ConfigService')

module.exports.handle = (event, context, callback) => {
  const encrypter = new Encrypter(configService.getValue('ENCRYPTION_KEY'))
  const validator = new Validator()
  const request = new Request(event, encrypter, validator)

  let paramCount = Object.keys(request.userParameters).length
  Log.info(`${request.responseFormat} request received with ${paramCount} parameters`)

  request.validate()
    .then(function () {
      let recipientCount = [].concat(
        request.recipients.cc,
        request.recipients.bcc,
        request.recipients.replyTo).length

      Log.info(`sending to '${request.recipients.to}' and ${recipientCount} other recipients`)

      const email = new Email(
        configService.getValue('SENDER_ARN'),
        configService.getValueWithDefault('MSG_SUBJECT', 'You have a form submission'),
        validator)

      return emailService.send(email.build(request.recipients, request.userParameters))
    })
    .then(function () {
      const statusCode = request.redirectUrl ? 302 : 200
      const message = configService.getValueWithDefault(
        'MSG_RECEIVE_SUCCESS',
        'Form submission successfully made')

      return Promise.resolve(new Response(statusCode, message))
    })
    .catch(function (error) {
      Log.error('error was caught while executing receive lambda', error)

      return Promise.resolve(new Response(error.statusCode, error.message))
    })
    .then(function (response) {
      Log.info(`returning http ${response.statusCode} response`)

      if (request.responseFormat === 'json') {
        callback(null, response.buildJson())
        return
      }

      if (request.responseFormat === 'plain' && request.redirectUrl) {
        callback(null, response.buildRedirect(request.redirectUrl))
        return
      }

      if (request.responseFormat === 'html') {
        const template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
        callback(null, response.buildHtml(template))
        return
      }
    })
}
