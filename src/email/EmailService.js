const aws = require('aws-sdk')
const ses = new aws.SES()

class EmailService {
  constructor (service) {
    this.service = service
  }

  send (email) {
    return this.service.sendEmail(email).promise()
  }
}

module.exports = new EmailService(ses)
