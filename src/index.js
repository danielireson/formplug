const fs = require('fs')
const path = require('path')
const util = require('util')

const request = require('request')
const aws = require('aws-sdk')
const ses = new aws.SES()

const config = require('../config.json')

module.exports.handler = require('./handler')({
  config: {
    ENCRYPTION_KEY: getValue('ENCRYPTION_KEY', config),
    SENDER_ARN: getValue('SENDER_ARN', config),
    SENDER: getValue('SENDER', config, 'Formplug'),
    WHITELISTED_RECIPIENTS: getValue('WHITELISTED_RECIPIENTS', config, null),
    MSG_SUBJECT: getValue('MSG_SUBJECT', config, 'You have a form submission'),
    MSG_RECEIVE_SUCCESS: getValue('MSG_RECEIVE_SUCCESS', config, 'Form submission successfully made')
  },
  isValidRecaptcha: req => {
    if (!config['RECAPTCHA_SECRET_KEY']) {
      return Promise.resolve(true)
    } else {
      return util.promisify(request.post)('https://www.google.com/recaptcha/api/siteverify', {
        form:{
          secret: getValue('RECAPTCHA_SECRET_KEY', config),
          response: req.recaptcha,
          remoteip: req.sourceIp
        },
        json: true
      }).then(response => !!response.body.success)
    }
  },
  sendEmail: email => {
    return ses.sendEmail(email).promise()
  },
  loadTemplate: () => {
    const customFilePath = path.resolve(__dirname, 'templates', 'custom.html')
    const defaultFilePath = path.resolve(__dirname, 'templates', 'default.html')
    const filePath = fs.existsSync(customFilePath) ? customFilePath : defaultFilePath
    return util.promisify(fs.readFile)(filePath).then(file => file.toString())
  },
})

function getValue (key, obj, defaultValue) {
  const value = obj[key]

  if (value === undefined || value === '') {
    if (defaultValue === undefined) {
      throw new Error(`Required config not found: ${key}`)
    } else {
      return defaultValue
    }
  }

  return value
}
