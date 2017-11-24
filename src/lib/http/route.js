'use strict'

const config = require('../../../config.json')
const httpValidation = require('./validation')
const httpResponse = require('./response')

module.exports.render = function (type, data, callback) {
  let routeDetails = module.exports.getRouteDetails(type, data)
  callback(null, httpResponse.build(routeDetails.statusCode, routeDetails.message, data))
}

module.exports.getRouteDetails = function (type, data) {
  let statusCode, message
  switch (type) {
    case 'encrypt-no-email':
      statusCode = 422
      message = config.MSG_ENCRYPT_NO_EMAIL || 'You need to provide an email address to encrypt.'
      break
    case 'encrypt-bad-email':
      statusCode = 422
      message = config.MSG_ENCRYPT_BAD_EMAIL || 'The supplied email address is not valid.'
      break
    case 'encrypt-success':
      statusCode = 200
      message = data['_encrypted']
      break
    case 'receive-honeypot':
      statusCode = 422
      message = config.MSG_RECEIVE_HONEYPOT || 'You shall not pass.'
      break
    case 'receive-no-email':
      statusCode = 422
      message = config.MSG_RECEIVE_NO_EMAIL || 'Form not sent, the admin has not set up a forwarding email address.'
      break
    case 'receive-bad-email':
      statusCode = 422
      message = config.MSG_RECEIVE_BAD_EMAIL || 'Form not sent, the admin email address is not valid.'
      break
    case 'receive-error':
      statusCode = 500
      message = config.MSG_RECEIVE_ERROR || 'Form not sent, an error occurred while sending.'
      break
    case 'receive-success':
      statusCode = httpValidation.hasRedirect(data) ? 302 : 200
      message = config.MSG_RECEIVE_SUCCESS || 'Form submission successfully made.'
      break
    default:
      statusCode = 500
      message = 'An error has occurred.'
  }
  return {statusCode, message}
}
