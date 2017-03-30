'use strict'

const config = require('../../config.json')
const validation = require('./validation')
const response = require('./response')

module.exports.render = function (type, data, callback) {
  let callbackResponse
  switch (type) {
    case 'encrypt-no-email':
      callbackResponse = response.build(422, config.MSG_ENCRYPT_NO_EMAIL || 'You need to provide an email address to encrypt.', data)
      break
    case 'encrypt-bad-email':
      callbackResponse = response.build(422, config.MSG_ENCRYPT_BAD_EMAIL || 'The supplied email address is not valid.', data)
      break
    case 'encrypt-success':
      let message = data['_encrypted']
      callbackResponse = response.build(200, message, data)
      break
    case 'receive-honeypot':
      callbackResponse = response.build(422, config.MSG_RECEIVE_HONEYPOT || 'You shall not pass.', data)
      break
    case 'receive-no-email':
      callbackResponse = response.build(422, config.MSG_RECEIVE_NO_EMAIL || 'Form not sent, the admin has not set up a forwarding email address.', data)
      break
    case 'receive-bad-email':
      callbackResponse = response.build(422, config.MSG_RECEIVE_BAD_EMAIL || 'Form not sent, the admin email address is not valid.', data)
      break
    case 'receive-error':
      callbackResponse = response.build(500, config.MSG_RECEIVE_ERROR || 'Form not sent, there was an error adding it to the database.', data)
      break
    case 'receive-success':
      let successStatusCode = validation.hasRedirect(data) ? 302 : 200
      callbackResponse = response.build(successStatusCode, config.MSG_RECEIVE_SUCCESS || 'Form submission successfully made.', data)
      break
    default:
      callbackResponse = response.build(500, 'An error has occurred.', data)
  }
  callback(null, callbackResponse)
}
