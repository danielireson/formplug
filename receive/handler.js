var querystring = require('querystring')

var validator = require('validator')

var database = require('./database')
var render = require('./render')

module.exports.handle = (event, context, callback) => {
  var form = querystring.parse(event.body)

  if (form['_honeypot'] !== undefined && !validator.isEmpty(form['_honeypot'])) {
    callback(null, render.response('honeypot'))
  }

  if (form['_send-to'] === undefined || !validator.isEmail(form['_send-to'])) {
    callback(null, render.response('no-admin-email'))
  }

  database.put(form, function() {

  })
}
