const fs = require('fs')
const path = require('path')

const Encrypter = require('./encryption/Encrypter')
const Email = require('./http/Email')
const Request = require('./http/Request')
const JsonResponse = require('./http/JsonResponse')
const HtmlResponse = require('./http/HtmlResponse')
const RedirectResponse = require('./http/RedirectResponse')
const PlainTextResponse = require('./http/PlainTextResponse')

const emailService = require('./services/EmailService')

const config = require('./utils/config')
const logging = require('./utils/logging')

module.exports.handle = (event, context, callback) => {
  const encrypter = new Encrypter(config.getValue('ENCRYPTION_KEY'))
  const request = new Request(event, encrypter)

  let paramCount = Object.keys(request.userParameters).length
  logging.info(`${request.responseFormat} request received with ${paramCount} parameters`)

  request.validate()
    .then(function () {
      let recipientCount = [].concat(
        request.recipients.cc,
        request.recipients.bcc,
        request.recipients.replyTo).length

      logging.info(`sending to '${request.recipients.to}' and ${recipientCount} other recipients`)

      const email = new Email(
        config.getValue('SENDER_ARN'),
        config.getValueWithDefault('MSG_SUBJECT', 'You have a form submission'))

      return emailService.send(email.build(request.recipients, request.userParameters))
    })
    .then(function () {
      const message = config.getValueWithDefault(
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
            config.getValueWithDefault('TEMPLATE', 'default.html'))).toString()

        response = new HtmlResponse(200, message, template)
      }

      return Promise.resolve(response)
    })
    .catch(function (error) {
      logging.error('error was caught while executing receive lambda', error)

      return Promise.resolve(new PlainTextResponse(error.statusCode, error.message))
    })
    .then(function (response) {
      logging.info(`returning http ${response.statusCode} response`)

      callback(null, response.build())
    })
}
