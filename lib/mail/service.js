'use strict'

const AWS = require('aws-sdk')
const sesClient = new AWS.SES()

module.exports.send = function (email) {
  return sesClient.sendEmail(email).promise()
}
