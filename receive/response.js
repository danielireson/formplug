const fs = require('fs')
const path = require('path')

const config = require('../config.json')

module.exports.render = function (type, callback) {
  let response = buildResponse(500, 'An error has occurred.')
  switch (type) {
    case 'honeypot':
      response = buildResponse(422, config.MSG_HONEYPOT || 'You shall not pass.')
      break
    case 'no-admin-email':
      response = buildResponse(422, config.MSG_NO_ADMIN_EMAIL || 'Form not sent, the admin has not set up a send-to address.')
      break
    case 'bad-admin-email':
      response = buildResponse(422, config.MSG_BAD_ADMIN_EMAIL || 'Form not sent, the admin email address is not valid.')
      break
    case 'error':
      response = buildResponse(500, config.MSG_ERROR || 'Form not sent, there was an error adding it to the database.')
      break
    case 'success':
      response = buildResponse(302, config.MSG_SUCCESS || 'Form submission successfully made.')
      break
  }
  callback(null, response)
  process.exit()
}

module.exports.redirect = function (redirect, callback) {
  let response = buildResponse(200, config.MSG_SUCCESS || 'Form submission successfully made.', redirect)
  callback(null, response)
  process.exit()
}

function buildResponse (statusCode, message, redirect) {
  let response = {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'text/html'
    },
    body: generateView(message)
  }
  if (redirect !== undefined) {
    response.headers.Location = redirect
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
