'use strict'

const log = require('../utility/log')
const config = require('../../config.json')
const validation = require('./validation')
const response = require('./response')

module.exports.render = function (type, data, callback) {
  let routeDetails = module.exports.getRouteDetails(type, data)
  callback(null, response.build(routeDetails.statusCode, routeDetails.message, data))
}

module.exports.renderError = function (message, error, data, callback) {
  log.error(['Error sending email', error, data])
  callback(new Error(message))
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
      message = config.MSG_RECEIVE_ERROR || 'Form not sent, there was an error adding it to the database.'
      break
    case 'receive-success':
      statusCode = validation.hasRedirect(data) ? 302 : 200
      message = config.MSG_RECEIVE_SUCCESS || 'Form submission successfully made.'
      break
    default:
      statusCode = 500
      message = 'An error has occurred.'
  }
  return {statusCode, message}
}
