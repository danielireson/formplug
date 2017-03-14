var fs = require('fs')
var path = require('path')

var config = require('../config.json')

module.exports.render = function (type, callback) {
  let response = build(500, 'An error has occurred.')
  switch (type) {
    case 'honeypot':
      response = build(422, config.MSG_HONEYPOT || 'You shall not pass.')
      break
    case 'no-admin-email':
      response = build(422, config.MSG_NO_ADMIN_EMAIL || 'Form not sent, the admin has not set up a send-to address.')
      break
    case 'error':
      response = build(500, config.MSG_ERROR || 'Form not sent, there was an error adding it to the database.')
      break
    case 'success':
      response = build(302, config.MSG_SUCCESS || 'Form submission successfully made.')
      break
  }
  callback(null, response)
  process.exit()
}

module.exports.redirect = function (redirect, callback) {
  let response = build(200, config.MSG_SUCCESS || 'Form submission successfully made.', redirect)
  callback(null, response)
  process.exit()
}

function build (statusCode, message, redirect) {
  var response = {
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
  var template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
  if (!template) {
    return message
  }
  return template.replace('{{ message }}', message)
}
