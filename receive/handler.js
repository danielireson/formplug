'use strict'

const querystring = require('querystring')

const database = require('./database')
const validate = require('./validate')
const response = require('./response')

module.exports.handle = (event, context, callback) => {
  let data = Object.assign(querystring.parse(event.body), event.pathParameters)
  validate.all(data, callback)
  database.put(data, function (error) {
    if (error) {
      response.render('error', data, callback)
    }

    response.render('success', data, callback)
  })
}
