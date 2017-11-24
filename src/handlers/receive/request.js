'use strict'

const querystring = require('querystring')

const httpValidation = require('../../lib/http/validation')
const httpEncryption = require('../../lib/http/encryption')
const httpRoute = require('../../lib/http/route')

module.exports.getParams = function (event) {
  let data = Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
  parseToParam(data)
  parseCcParam(data)
  return data
}

module.exports.validate = function (data, callback) {
  return hasNoHoneypot(data, callback) && hasValidEmail(data, callback)
}

function parseToParam (data) {
  if (hasEncryptedToEmail(data)) {
    data['_to'] = httpEncryption.decrypt(data['_to'])
  }
}

function parseCcParam (data) {
  if ('_cc' in data) {
    let emails = data['_cc'].split(';')
    data['_cc'] = emails.filter(function (email) {
      return httpValidation.isEmail(email)
    })
  } else {
    data['_cc'] = []
  }
}

function hasEncryptedToEmail (data) {
  return '_to' in data && httpValidation.isEmail(httpEncryption.decrypt(data['_to']))
}

function hasNoHoneypot (data, callback) {
  if ('_honeypot' in data && data['_honeypot'] !== '') {
    httpRoute.render('receive-honeypot', data, callback)
    return false
  }
  return true
}

function hasValidEmail (data, callback) {
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
