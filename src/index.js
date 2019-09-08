const fs = require('fs')
const path = require('path')
const util = require('util')

const aws = require('aws-sdk')
const ses = new aws.SES()

const config = require('../config.json')

module.exports.handler = require('./handler')({
  config: {
    ENCRYPTION_KEY: getValue('ENCRYPTION_KEY', config),
    SENDER_ARN: getValue('SENDER_ARN', config),
    SENDER: getValue('SENDER', config, 'Formplug'),
    MSG_SUBJECT: getValue('MSG_SUBJECT', config, 'You have a form submission'),
    MSG_RECEIVE_SUCCESS: getValue('MSG_RECEIVE_SUCCESS', config, 'Form submission successfully made')
  },
  sendEmail: email => {
    return ses.sendEmail(email).promise()
  },
  loadTemplate: () => {
    const fileName = getValue('TEMPLATE', config, 'default.html')
    const filePath = path.resolve(__dirname, 'templates', fileName)
    return util.promisify(fs.readFile)(filePath).then(file => file.toString())
  },
})

function getValue (key, obj, defaultValue) {
  const value = obj[key]

  if (value == null || value === '') {
    if (!defaultValue) {
      throw new Error(`Required config not found: ${key}`)
    } else {
      return defaultValue
    }
  }

  return value
}
