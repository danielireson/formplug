'use strict'

const fs = require('fs')
const path = require('path')

const validation = require('./validation')

module.exports.build = function (statusCode, message, data) {
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
