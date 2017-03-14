var fs = require('fs')
var path = require('path')

var config = require('../config.json')

module.exports.response = function(type) {
  switch(type) {
    case 'honeypot': 
      return buildResponse(422, config.MSG_HONEYPOT || 'You shall not pass')
      break
    case 'no-admin-email':
      return buildResponse(422, config.MSG_MISSING_SEND_TO || 'Form not sent, the admin has not set up a send-to address.')
      break
    default:
      return buildResponse(500)
  }
}

function buildResponse(statusCode, message, redirect) {
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

function generateView(message) {
  var template =  fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
  if (!template) {
    return message
  }
  return template.replace('{{ message }}', message)
}
