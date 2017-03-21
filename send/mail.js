'use strict'

const AWS = require('aws-sdk')

const config = require('../config.json')

module.exports.send = function (data, callback) {
  let sesClient = new AWS.SES()
  return sesClient.sendEmail(buildEmail(data), (error) => callback(error))
}

function buildEmail (data) {
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
  return message
}
