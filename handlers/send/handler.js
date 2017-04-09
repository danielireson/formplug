'use strict'

const databaseService = require('../../lib/database/service')
const mailBuilder = require('../../lib/mail/builder')
const mailService = require('../../lib/mail/service')
const utilityLog = require('../../lib/utility/log')
const sendRequest = require('./request')

module.exports.handle = (event, context, callback) => {
  if (event.Records[0].eventName === 'INSERT') {
    let params = sendRequest.getParams(event)
    let email = mailBuilder.build(params.data)
    mailService.send(email)
      .then(() => utilityLog.success('Successfully sent email'))
      .then(() => databaseService.delete(params.id))
      .then(() => utilityLog.success('Successfully deleted queue item'))
      .catch(function (error) {
        utilityLog.error(['Error sending email', params.data, error], callback)
      })
  }
}
