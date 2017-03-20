'use strict'

const querystring = require('querystring')

const database = require('./database')
const request = require('./request')
const response = require('./response')

module.exports.handle = (event, context, callback) => {
  let data = Object.assign(querystring.parse(event.body), event.pathParameters)
  request.validate(data, callback)
  database.put(data, function (error) {
    if (error) {
      console.error('Error adding to the database for ' + data['_to'])
      console.error(data)
      response.render('error', data, callback)
    }
    console.log('Successfully queued for ' + data['_to'])
    response.render('success', data, callback)
  })
}
