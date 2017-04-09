'use strict'

const databaseEncryption = require('../../lib/database/encryption')
const httpRoute = require('../../lib/http/route')
const encryptRequest = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = encryptRequest.getParams(event)
  if (encryptRequest.isValid(data, callback)) {
    data['_encrypted'] = databaseEncryption.encryptString(data['_email'])
    httpRoute.render('encrypt-success', data, callback)
  }
}
