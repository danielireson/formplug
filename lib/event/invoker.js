'use strict'

const aws = require('aws-sdk')
const lambda = new aws.Lambda()

const config = require('../../config.json')

module.exports.send = function (data) {
  let event = {
    FunctionName: `${config.SERVICE_NAME}-${config.STAGE}-send`,
    InvocationType: 'Event',
    Payload: JSON.stringify(data)
  }
  return lambda.invoke(event).promise()
}
