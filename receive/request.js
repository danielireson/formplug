'use strict'

const validation = require('../lib/http/validation')
const route = require('../lib/http/route')

module.exports.validate = function (data, callback) {
  checkHoneyPot(data, callback)
  checkToParam(data, callback)
}

function checkHoneyPot (data, callback) {
  if ('_honeypot' in data) {
    route.render('receive-honeypot', data, callback)
  }
}

function checkToParam (data, callback) {
  if (!('_to' in data)) {
    route.render('receive-no-email', data, callback)
  }
  if ('_to' in data && !validation.isEmail(data['_to'])) {
    route.render('receive-bad-email', data, callback)
  }
}
