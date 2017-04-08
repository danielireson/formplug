'use strict'

const querystring = require('querystring')

const validation = require('../../lib/http/validation')
const encryption = require('../../lib/database/encryption')
const route = require('../../lib/http/route')

module.exports.getParams = function (event) {
  return Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
}

module.exports.isValid = function (data, callback) {
  return checkHoneyPot(data, callback) && checkToParam(data, callback)
}

module.exports.hasEncryptedToEmail = function (data) {
  return validation.isEmail(encryption.decryptString(data['_to']))
}

function checkHoneyPot (data, callback) {
  if ('_honeypot' in data) {
    route.render('receive-honeypot', data, callback)
    return false
  }
  return true
}

function checkToParam (data, callback) {
  if (!('_to' in data)) {
    route.render('receive-no-email', data, callback)
    return false
  }
  if ('_to' in data && !validation.isEmail(data['_to']) && !module.exports.hasEncryptedToEmail(data)) {
    route.render('receive-bad-email', data, callback)
    return false
  }
  return true
}
