'use strict'

const querystring = require('querystring')

const database = require('../lib/storage/database')
const log = require('../lib/utility/log')
const route = require('../lib/http/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = Object.assign({}, querystring.parse(event.body), event.pathParameters, event.queryStringParameters)
  if (!request.isValid(data, callback)) return false
  database.put(data, function (error) {
    if (error) {
      log.error(['Error adding to the database', data, event])
      route.render('receive-error', data, callback)
    }
    log.success('Successfully queued email')
    route.render('receive-success', data, callback)
  })
}
