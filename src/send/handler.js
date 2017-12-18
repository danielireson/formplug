const Email = require('./Email')
const Log = require('../common/Log')

const aws = require('../services/AwsService')
const config = require('../../config.json')

module.exports.handle = (event, context, callback) => {
  new Email(getSenderArn(), getSubject()).build(event.recipients, event.userParameters)
    .then(function (email) {
      Log.info(`sending email to '${event.recipients.to}'`)
      return sendEmail(email)
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

function getSubject () {
  if ('MSG_SUBJECT' in config && config.MSG_SUBJECT !== '') {
    return config.MSG_SUBJECT
  } else {
    return 'You have a form submission'
  }
}

function sendEmail (email) {
  if (process.env.NODE_ENV !== 'testing') {
    return aws.sendEmail(email)
  } else {
    return Promise.resolve()
  }
}
