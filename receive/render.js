var fs = require('fs')

module.exports.response = function(statusCode, message, redirect) {
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
  var template =  fs.readFileSync('template.html').toString()
  if (!template) {
    return message
  }
  return template.replace('{{ message }}', message)
}
