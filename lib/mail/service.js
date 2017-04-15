'use strict'

const aws = require('aws-sdk')
const sesClient = new aws.SES()

module.exports.send = function (email) {
  return sesClient.sendEmail(email).promise()
}
