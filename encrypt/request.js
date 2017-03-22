'use strict'

const validation = require('../lib/validation')
const response = require('../lib/response')

module.exports.validate = function (data, callback) {
  if (!('_email' in data)) {
    response.render('no-encrypt-email', data, callback)
  }
  if ('_email' in data && !validation.isEmail(data['_email'])) {
    response.render('bad-encrypt-email', data, callback)
  }
}
