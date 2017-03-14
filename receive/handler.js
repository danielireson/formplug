var querystring = require('querystring')

var validator = require('validator')

var config = require('../config.json')
var database = require('./database')
var render = require('./render')

module.exports.handle = (event, context, callback) => {
  var form = querystring.parse(event.body)

  if (form['_honeypot'] !== undefined && !validator.isEmpty(form['_honeypot'])) {
    callback(null, render.response(422, config.MSG_HONEYPOT || 'You shall not pass'))
  }

  if (form['_send-to'] === undefined || !validator.isEmail(form['_send-to'])) {
    callback(null, render.response(422, config.MSG_MISSING_SEND_TO || 'Form not sent, the admin has not set up a send-to address.'))
  }

  database.put(form)
}
