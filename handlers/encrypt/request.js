'use strict'

const querystring = require('querystring')

const httpValidation = require('../../lib/http/validation')
const httpRoute = require('../../lib/http/route')

module.exports.getParams = function (event) {
  return Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
}

module.exports.validate = function (data, callback) {
  return hasEmail(data, callback) && hasValidEmail(data, callback)
}

function hasEmail (data, callback) {
  if (!('_email' in data)) {
    httpRoute.render('encrypt-no-email', data, callback)
    return false
  }
  return true
}

function hasValidEmail (data, callback) {
  if ('_email' in data && !httpValidation.isEmail(data['_email'])) {
    httpRoute.render('encrypt-bad-email', data, callback)
    return false
  }
  return true
}
