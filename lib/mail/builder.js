'use strict'

const config = require('../../config.json')

module.exports.build = function (data) {
  return {
    Source: buildSource(),
    Destination: {
      ToAddresses: [
        data['_to']
      ]
    },
    Message: {
      Subject: {
        Data: 'You have a form submission'
      },
      Body: {
        Text: {
          Data: buildMessage(data)
        }
      }
    }
  }
}

function buildSource () {
  let arnArray = config.FROM_ARN.split('/')
  let email = arnArray[arnArray.length - 1]
  return 'Formplug <' + email + '>'
}

function buildMessage (data) {
  let message = ''
  for (let field in data) {
    // Don't send private variables prefixed with an underscore
    if (field.slice(0, 1) !== '_') {
      message += field.toUpperCase() + ': ' + data[field] + '\r\n'
    }
  }
  message += '---' + '\r\n'
  message += 'Sent with Formplug'
  return message
}
