'use strict'

const encryption = require('../lib/encryption')
const response = require('../lib/response')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = Object.assign(event.pathParameters, event.queryStringParameters)
  request.validate(data, callback)
  data['_encrypted'] = encryption.encrypt(data['_email'])
  response.render('encrypt-success', data, callback)
}
