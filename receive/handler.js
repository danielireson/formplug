'use strict'

const querystring = require('querystring')

const database = require('../lib/database')
const log = require('../lib/log')
const route = require('../lib/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = Object.assign(querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
  request.validate(data, callback)
  database.put(data, function (error) {
    if (error) {
      log.error(['Error adding to the database', data, event])
      route.render('receive-error', data, callback)
    }
    log.success('Successfully queued email')
    route.render('receive-success', data, callback)
  })
}
