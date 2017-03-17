'use strict'

const fs = require('fs')
const path = require('path')

const config = require('../config.json')
const validate = require('./validate')

module.exports.render = function (type, data, callback) {
  let response = buildResponse(500, 'An error has occurred.', data)
  switch (type) {
    case 'honeypot':
      response = buildResponse(422, config.MSG_HONEYPOT || 'You shall not pass.', data)
      break
    case 'no-admin-email':
      response = buildResponse(422, config.MSG_NO_ADMIN_EMAIL || 'Form not sent, the admin has not set up a forwarding email address.', data)
      break
    case 'bad-admin-email':
      response = buildResponse(422, config.MSG_BAD_ADMIN_EMAIL || 'Form not sent, the admin email address is not valid.', data)
      break
    case 'error':
      response = buildResponse(500, config.MSG_ERROR || 'Form not sent, there was an error adding it to the database.', data)
      break
    case 'success':
      let successStatusCode = validate.hasRedirect(data) ? 302 : 200
      response = buildResponse(successStatusCode, config.MSG_SUCCESS || 'Form submission successfully made.', data)
      break
  }
  callback(null, response)
}

function buildResponse (statusCode, message, data) {
  if (validate.isJsonResponse(data)) {
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
