'use strict'

const encryption = require('../../lib/database/encryption')
const route = require('../../lib/http/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = request.getParams(event)
  if (request.isValid(data, callback)) {
    data['_encrypted'] = encryption.encryptString(data['_email'])
    route.render('encrypt-success', data, callback)
  }
}
