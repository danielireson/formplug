'use strict'

const querystring = require('querystring')

const httpValidation = require('../../lib/http/validation')
const httpEncryption = require('../../lib/http/encryption')
const httpRoute = require('../../lib/http/route')

module.exports.getParams = function (event) {
  let data = Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
  if (hasEncryptedToEmail(data)) {
    data['_to'] = httpEncryption.decrypt(data['_to'])
  }
  return data
}

module.exports.isValid = function (data, callback) {
  return checkHoneyPot(data, callback) && checkToParam(data, callback)
}

function hasEncryptedToEmail (data) {
  return '_to' in data && httpValidation.isEmail(httpEncryption.decrypt(data['_to']))
}

function checkHoneyPot (data, callback) {
  if ('_honeypot' in data && data['_honeypot'] !== '') {
    httpRoute.render('receive-honeypot', data, callback)
    return false
  }
  return true
}

function checkToParam (data, callback) {
  if (!('_to' in data)) {
    httpRoute.render('receive-no-email', data, callback)
    return false
  }
  if ('_to' in data && !httpValidation.isEmail(data['_to'])) {
    httpRoute.render('receive-bad-email', data, callback)
    return false
  }
  return true
}
