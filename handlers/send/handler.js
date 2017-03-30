'use strict'

const database = require('../../lib/storage/database')
const log = require('../../lib/utility/log')
const request = require('./request')
const mail = require('./mail')

module.exports.handle = (event, context, callback) => {
  if (event.Records[0].eventName === 'INSERT') {
    let params = request.getParams(event)
    mail.send(params.data, function (error) {
      if (error) {
        log.error(['Error sending email', error, params.data])
        return false
      } else {
        log.success('Successfully sent email')
        database.delete(params.id, function (error) {
          if (error) {
            log.error(['Error deleting from queue', error, event])
            return false
          } else {
            log.success('Successfully deleted queue item')
          }
        })
      }
    })
  }
}
