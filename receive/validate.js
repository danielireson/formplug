var validator = require('validator')

var response = require('./response')

module.exports.all = function (data, callback) {
  checkHoneyPot(data, callback)
  checkToParam(data, callback)
}

function checkHoneyPot (data, callback) {
  if (data['_honeypot'] !== undefined && !validator.isEmpty(data['_honeypot'])) {
    response.render('honeypot', data, callback)
  }
}

function checkToParam (data, callback) {
  if (!('_to' in data)) {
    response.render('no-admin-email', data, callback)
  }

  if (!validator.isEmail(data['_to'])) {
    response.render('bad-admin-email', data, callback)
  }
}

module.exports.hasRedirect = function (data) {
  if (data['_redirect-to'] !== undefined && validator.isURL(data['_redirect-to'])) {
    return true
  }
  return false
}
