'use strict'

const mailBuilder = require('../../lib/mail/builder')
const mailService = require('../../lib/mail/service')
const utilityLog = require('../../lib/utility/log')

module.exports.handle = (event, context, callback) => {
  let email = mailBuilder.build(event)
  mailService.send(email)
    .then(function () {
      utilityLog.success('Successfully sent email')
    })
    .catch(function (error) {
      utilityLog.error(['Error sending email', event, error], callback)
    })
}
