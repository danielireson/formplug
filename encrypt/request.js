'use strict'

const validation = require('../lib/validation')
const route = require('../lib/route')

module.exports.validate = function (data, callback) {
  if (!('_email' in data)) {
    route.render('no-encrypt-email', data, callback)
  }
  if ('_email' in data && !validation.isEmail(data['_email'])) {
    route.render('bad-encrypt-email', data, callback)
  }
}
