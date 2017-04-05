'use strict'

const database = require('../../lib/database/database')
const log = require('../../lib/utility/log')
const route = require('../../lib/http/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = request.getParams(event)
  if (!request.isValid(data, callback)) return false
  database.put(data)
    .then(() => log.success('Successfully queued email'))
    .then(() => route.renderHttp('receive-success', data, callback))
    .catch(function (error) {
      log.error(['Error adding to the database', data, error])
      route.renderHttp('receive-error', data, callback)
    })
}
