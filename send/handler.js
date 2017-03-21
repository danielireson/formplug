'use strict'

const database = require('../lib/database')
const encryption = require('../lib/encryption')
const mailer = require('./mailer')

module.exports.handle = (event, context, callback) => {
  let eventData = event.Records[0].dynamodb.NewImage
  let id = eventData.id.S
  let data = encryption.decrypt(eventData.data.S)
  mailer.send(data, function (error) {
    if (error) {
      console.error('Error sending email for ' + data['_to'])
      console.error(error)
      console.error(data)
    } else {
      console.log('Successfully sent email to ' + data['_to'])
      database.delete(id, function (error) {
        if (error) {
          console.error('Error deleting from queue for ' + id)
          console.error(error)
        } else {
          console.log('Successfully deleted queue item')
        }
      })
    }
  })
}
