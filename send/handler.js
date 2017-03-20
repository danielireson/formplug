'use strict'

const encryption = require('../lib/encryption')
const mailer = require('./mailer')

module.exports.handle = (event, context, callback) => {
  let eventData = event.Records[0].dynamodb.NewImage.data.S
  let data = encryption.decrypt(eventData)
  mailer.send(data, function (error) {
    if (error) {
      console.error('Error sending email for ' + data['_to'])
      console.error(error)
      console.error(data)
    } else {
      console.log('Email successfully sent to ' + data['_to'])
    }
  })
}
