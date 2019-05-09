const fs = require('fs')
const path = require('path')

const Email = require('./http/Email')
const Encrypter = require('./common/Encrypter')
const Log = require('./common/Log')
const Request = require('./http/Request')
const JsonResponse = require('./http/JsonResponse')
const HtmlResponse = require('./http/HtmlResponse')
const RedirectResponse = require('./http/RedirectResponse')
const PlainTextResponse = require('./http/PlainTextResponse')
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
      const message = configService.getValueWithDefault(
        'MSG_RECEIVE_SUCCESS',
        'Form submission successfully made')

      let response = null

      if (request.responseFormat === 'json') {
        response = new JsonResponse(200, message)
      } else if (request.redirectUrl) {
        response = new RedirectResponse(302, message, request.redirectUrl)
      } else {
        const template = fs.readFileSync(
          path.resolve(
            __dirname,
            'templates',
            configService.getValueWithDefault('TEMPLATE', 'default.html'))).toString()

        response = new HtmlResponse(200, message, template)
      }

      return Promise.resolve(response)
    })
    .catch(function (error) {
      Log.error('error was caught while executing receive lambda', error)

      return Promise.resolve(new PlainTextResponse(error.statusCode, error.message))
    })
    .then(function (response) {
      Log.info(`returning http ${response.statusCode} response`)

      callback(null, response.build())
    })
}
