const fs = require('fs')
const path = require('path')

const Encrypter = require('../common/encrypter')
const Request = require('./Request')
const Response = require('./Response')

const aws = require('../services/AwsService')
const config = require('../../config.json')

module.exports.handle = (event, context, callback) => {
  const encrypter = new Encrypter(getEncryptionKey())
  const request = new Request(event, encrypter)

  request.validate()
    .then(function () {
      const payload = {recipients: request.recipients, userParameters: request.userParameters}
      return aws.invokeLambda(config.SERVICE_NAME, config.STAGE, 'send', payload)
    })
    .then(function () {
      const statusCode = request.redirectUrl ? 302 : 200
      const message = config.MSG_RECEIVE_SUCCESS || 'Form submission successfully made'
      return Promise.resolve(new Response(statusCode, message))
    })
    .catch(function (error) {
      const response = new Response(error.statusCode, error.message)
      return Promise.resolve(response)
    })
    .then(function (response) {
      if (request.redirectUrl) {
        callback(null, response.buildRedirect(request.redirectUrl))
        return
      }
      if (request.responseFormat === 'json') {
        callback(null, response.buildJson())
        return
      }
      if (request.responseFormat === 'html') {
        const template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString()
        callback(null, response.buildHtml(template))
        return
      }
    })
}

function getEncryptionKey () {
  if ('ENCRYPTION_KEY' in config && config.ENCRYPTION_KEY !== '') {
    return config.ENCRYPTION_KEY
  } else {
    throw new Error("Please set 'ENCRYPTION_KEY' in config.json")
  }
}
