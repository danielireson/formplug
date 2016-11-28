'use strict'

var crypto = require('crypto')
var querystring = require('querystring')
var filesystem = require('fs')

var AWS = require('aws-sdk')
var config = require('./config.json')
var uuid = require('uuid')
var validator = require('validator')

module.exports.handler = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient()
  var form = querystring.parse(event.body)
  var payload = {}

  if (form['_honeypot'] !== undefined && !validator.isEmpty(form['_honeypot'])) {
    callback(null, response(422, config.MSG_HONEYPOT || 'You shall not pass'))
  } 

  if (form['_send-to'] === undefined || !validator.isEmail(form['_send-to'])) {
    callback(null, response(422, config.MSG_MISSING_SEND_TO || 'Form not sent, the admin has not set up a send-to address.'))
  }

  payload.id = uuid.v4()
  var data = {}
  for (var key in form) {
    data[key] = validator.trim(form[key])
  }
  payload.data = encrypt(JSON.stringify(data))

  docClient.put({TableName: config.TABLE_NAME, Item: payload}, (error) => {
    if (error) {
      callback(null, response(422, config.MSG_DB_ERROR || 'Form not sent, there was an error adding it to the database.'))
    }

    if (form['_redirect-to'] !== undefined && validator.isURL(form['_redirect-to'])) {
      callback(null, response(301, config.MSG_SUCCESS || 'Form submission successfully made.', form['_redirect-to']))
    }

    callback(null, response(200, config.MSG_SUCCESS || 'Form submission successfully made.'))
  })
}

function response(statusCode, message, redirect) {
  var response = {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'text/html'
    },
    body: generateView(message)
  }

  if (redirect !== undefined) {
    response.headers.Location = redirect
  }

  return response
}

function encrypt(text) {
  var cipher = crypto.createCipher('aes-256-ctr', config.ENCRYPTION_KEY)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

function generateView(message) {
  var template =  filesystem.readFileSync('template.html').toString()
  
  if (!template) {
    return message
  }

  return template.replace('{{ message }}', message)
}
