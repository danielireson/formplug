'use strict'

const databaseService = require('../../lib/database/service')
const mailBuilder = require('../../lib/mail/builder')
const mailService = require('../../lib/mail/service')
const log = require('../../lib/utility/log')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  if (event.Records[0].eventName === 'INSERT') {
    let params = request.getParams(event)
    let email = mailBuilder.build(params.data)
    mailService.send(email)
      .then(() => log.success('Successfully sent email'))
      .then(() => databaseService.delete(params.id))
      .then(() => log.success('Successfully deleted queue item'))
      .catch(function (error) {
        log.error(['Error sending email', params.data, error], callback)
      })
  }
}
