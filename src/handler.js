const Email = require('./email/Email')
const Request = require('./request/Request')
const HttpError = require('./error/HttpError')
const JsonResponse = require('./response/JsonResponse')
const HtmlResponse = require('./response/HtmlResponse')
const RedirectResponse = require('./response/RedirectResponse')
const PlainTextResponse = require('./response/PlainTextResponse')

const logging = require('./lib/logging')

module.exports = container => async event => {
  const request = new Request(event, container.config.ENCRYPTION_KEY)

  let error
  let response

  try {
    error = request.validate()

    if (error) {
      throw error
    }

    const recipientCount = [].concat(
      request.recipients.cc,
      request.recipients.bcc,
      request.recipients.replyTo).length

    logging.info(`sending to '${request.recipients.to}' and ${recipientCount} other recipients`)

    const email = new Email(
      container.config.SENDER,
      container.config.SENDER_ARN,
      container.config.MSG_SUBJECT,
      request.recipients,
      request.userParameters)

    error = email.validate()

    if (error) {
      throw error
    }

    await container.sendEmail(email)

    const message = container.config.MSG_RECEIVE_SUCCESS

    if (request.isJsonResponse()) {
      response = new JsonResponse(200, message)
    } else if (request.isRedirectResponse()) {
      response = new RedirectResponse(302, message, request.redirectUrl)
    } else {
      try {
        response = new HtmlResponse(200, message, await container.loadTemplate())
      } catch (error) {
        logging.error('unable to load template file', error)
        response = new PlainTextResponse(200, message)
      }
    }
  } catch (error) {
    logging.error('error was caught while executing receive lambda', error)

    let statusCode = 500
    let message = 'An unexpected error occurred'

    if (error instanceof HttpError) {
      statusCode = error.statusCode
      message = error.message
    }

    if (request.isJsonResponse()) {
      response = new JsonResponse(statusCode, message)
    } else {
      try {
        response = new HtmlResponse(statusCode, message, await container.loadTemplate())
      } catch (error) {
        logging.error('unable to load template file', error)
        response = new PlainTextResponse(statusCode, message)
      }
    }
  }

  logging.info(`returning http ${response.statusCode} response`)

  return response.build()
}
