'use strict'

const httpEncryption = require('../../lib/http/encryption')
const httpRoute = require('../../lib/http/route')
const encryptRequest = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = encryptRequest.getParams(event)
  if (encryptRequest.validate(data, callback)) {
    data['_encrypted'] = httpEncryption.encrypt(data['_email'])
    httpRoute.render('encrypt-success', data, callback)
  }
}
