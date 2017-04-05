'use strict'

const database = require('../../lib/database/database')
const log = require('../../lib/utility/log')
const route = require('../../lib/http/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = request.getParams(event)
  if (request.isValid(data, callback)) {
    database.put(data)
      .then(() => log.success('Successfully queued email'))
      .then(() => route.render('receive-success', data, callback))
      .catch(function (error) {
        log.error(['Error adding to the database', data, error])
        route.render('receive-error', data, callback)
      })
  }
}
