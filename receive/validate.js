var validator = require('validator')

var response = require('./response')

module.exports.all = function(data, callback) {
  if (data['_honeypot'] !== undefined && !validator.isEmpty(data['_honeypot'])) {
    callback(null, response.render('honeypot'))
    process.exit()
  }

  if (data['_send-to'] === undefined || !validator.isEmail(data['_send-to'])) {
    callback(null, response.render('no-admin-email'))
    process.exit()
  }
}

module.exports.hasRedirect = function(data) {
  if (data['_redirect-to'] !== undefined && validator.isURL(data['_redirect-to'])) {
    return true
  }
  return false
}
