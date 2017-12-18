const Email = require('./Email')
const Log = require('../common/Log')

const aws = require('../services/AwsService')
const config = require('../../config.json')

module.exports.handle = (event, context, callback) => {
  new Email(getSenderArn()).build(event.recipients, event.userParameters)
    .then(function (email) {
      Log.info(`sending email to '${event.recipients.to}'`)
      return aws.sendEmail(email)
    })
    .then(function () {
      Log.info(`email successfully sent to '${event.recipients.to}'`)
    })
    .catch(function (error) {
      Log.error(`error sending email to '${event.recipients.to}'`, error)
    })
}

function getSenderArn () {
  if ('SENDER_ARN' in config && config.SENDER_ARN !== '') {
    return config.SENDER_ARN
  } else {
    Log.error("please set 'SENDER_ARN' in 'config.json'")
    return ''
  }
}
