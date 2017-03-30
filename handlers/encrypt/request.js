'use strict'

const querystring = require('querystring')

const validation = require('../../lib/http/validation')
const route = require('../../lib/http/route')

module.exports.getParams = function (event) {
  return Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
}

module.exports.validate = function (data, callback) {
  if (!('_email' in data)) {
    route.render('no-encrypt-email', data, callback)
  }
  if ('_email' in data && !validation.isEmail(data['_email'])) {
    route.render('bad-encrypt-email', data, callback)
  }
}
