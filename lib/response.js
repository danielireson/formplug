'use strict'

const fs = require('fs')
const path = require('path')

const config = require('../config.json')
const validation = require('./validation')

module.exports.render = function (type, data, callback) {
  let response = buildResponse(500, 'An error has occurred.', data)
  switch (type) {
    case 'encrypt-bad-encrypt-email':
      response = buildResponse(422, config.MSG_ENCRYPT_BAD_EMAIL || 'The supplied email address is not valid.', data)
      break
    case 'encrypt-no-encrypt-email':
      response = buildResponse(422, config.MSG_ENCRYPT_NO_EMAIL || 'You need to provide an email address to encrypt.', data)
      break
    case 'encrypt-success':
      let message = data['_encrypted']
      response = buildResponse(200, message, data)
      break
    case 'receive-honeypot':
      response = buildResponse(422, config.MSG_RECEIVE_HONEYPOT || 'You shall not pass.', data)
      break
    case 'receive-no-admin-email':
      response = buildResponse(422, config.MSG_RECEIVE_NO_EMAIL || 'Form not sent, the admin has not set up a forwarding email address.', data)
      break
    case 'receive-bad-admin-email':
      response = buildResponse(422, config.MSG_RECEIVE_BAD_EMAIL || 'Form not sent, the admin email address is not valid.', data)
      break
    case 'receive-error':
      response = buildResponse(500, config.MSG_RECEIVE_ERROR || 'Form not sent, there was an error adding it to the database.', data)
      break
    case 'receive-success':
      let successStatusCode = validation.hasRedirect(data) ? 302 : 200
      response = buildResponse(successStatusCode, config.MSG_RECEIVE_SUCCESS || 'Form submission successfully made.', data)
      break
  }
  callback(null, response)
}

function buildResponse (statusCode, message, data) {
  if (validation.isJsonResponse(data)) {
    return buildJsonResponse(statusCode, message, data)
  }
  return buildHtmlResponse(statusCode, message, data)
}

function buildJsonResponse (statusCode, message, data) {
  let response = {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      statusCode: statusCode,
      message: message
    })
  }
  return response
}

function buildHtmlResponse (statusCode, message, data) {
  let response = {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'text/html'
    },
    body: generateView(message)
  }
  if (statusCode === 302) {
    response.headers.Location = data['_redirect']
  }
  return response
}

function generateView (message) {
  let template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
  if (!template) {
    return message
  }
  return template.replace('{{ message }}', message)
}
