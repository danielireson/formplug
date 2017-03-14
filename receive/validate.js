var validator = require('validator')

var render = require('./render')

module.exports.all = function(data, callback) {
  if (data['_honeypot'] !== undefined && !validator.isEmpty(data['_honeypot'])) {
    callback(null, render.response('honeypot'))
    process.exit()
  }

  if (data['_send-to'] === undefined || !validator.isEmail(data['_send-to'])) {
    callback(null, render.response('no-admin-email'))
    process.exit()
  }  
}
