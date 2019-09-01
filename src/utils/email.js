const aws = require('aws-sdk')
const ses = new aws.SES()

module.exports.sendEmail = email => {
  ses.sendEmail(email).promise()
}
