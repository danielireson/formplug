'use strict'

const validation = require('../lib/validation')
const response = require('./response')

module.exports.validate = function (data, callback) {
  checkHoneyPot(data, callback)
  checkToParam(data, callback)
}

function checkHoneyPot (data, callback) {
  if ('_honeypot' in data) {
    response.render('honeypot', data, callback)
  }
}

function checkToParam (data, callback) {
  if (!('_to' in data)) {
    response.render('no-admin-email', data, callback)
  }
  if ('_to' in data && !validation.isEmail(data['_to'])) {
    response.render('bad-admin-email', data, callback)
  }
}
