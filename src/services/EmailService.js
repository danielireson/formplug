const aws = require('aws-sdk')

class EmailService {
  constructor (service) {
    this.service = service
  }

  send (email) {
    return new this.service.SES().sendEmail(email).promise()
  }
}

module.exports = new EmailService(aws)
