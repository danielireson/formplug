const Email = require('./Email')

const aws = require('../services/AwsService')
const config = require('../../config.json')

module.exports.handle = (event, context, callback) => {
  new Email(getSenderArn()).build(event.recipients, event.userParameters)
    .then(function (email) {
      console.log(`sending email to '${event.recipients.to}'`)
      return aws.sendEmail(email)
    })
    .then(function () {
      console.log('email successfully sent')
    })
    .catch(function (error) {
      console.log('error sending email')
      callback(error)
    })
}

function getSenderArn () {
  if ('SENDER_ARN' in config && config.SENDER_ARN !== '') {
    return config.SENDER_ARN
  } else {
    throw new Error("Please set 'SENDER_ARN' in config.json")
  }
}
