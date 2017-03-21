'use strict'

const database = require('../lib/database')
const encryption = require('../lib/encryption')
const log = require('../lib/log')
const mail = require('./mail')

module.exports.handle = (event, context, callback) => {
  if (event.Records[0].eventName === 'INSERT') {
    let eventData = event.Records[0].dynamodb.NewImage
    let id = eventData.id.S
    let data = encryption.decrypt(eventData.data.S)
    mail.send(data, function (error) {
      if (error) {
        log.error(['Error sending email', error, data])
      } else {
        log.success('Successfully sent email')
        database.delete(id, function (error) {
          if (error) {
            log.error(['Error deleting from queue', error, event])
          } else {
            log.success('Successfully deleted queue item')
          }
        })
      }
    })
  }
}
