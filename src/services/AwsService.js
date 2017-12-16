class Aws {
  constructor (aws) {
    this.aws = aws
  }

  invokeLambda (serviceName, stage, functionName, payload) {
    let event = {
      FunctionName: `${serviceName}-${stage}-${functionName}`,
      InvocationType: 'Event',
      Payload: JSON.stringify(payload)
    }
    return new this.aws.Lambda().invoke(event).promise()
  }

  sendEmail (email) {
    return new this.aws.SES().sendEmail(email).promise()
  }
}

module.exports = Aws
