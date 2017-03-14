var fs = require('fs')
var path = require('path')

var config = require('../config.json')

module.exports.render = function(type) {
  switch(type) {
    case 'honeypot': 
      return build(422, config.MSG_HONEYPOT || 'You shall not pass')
      break
    case 'no-admin-email':
      return build(422, config.MSG_MISSING_SEND_TO || 'Form not sent, the admin has not set up a send-to address.')
      break
    default:
      return build(500)
  }
}

function build(statusCode, message, redirect) {
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
