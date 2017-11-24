'use strict'

const eventInvoker = require('../../lib/event/invoker')
const utilityLog = require('../../lib/utility/log')
const httpRoute = require('../../lib/http/route')
const receiveRequest = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = receiveRequest.getParams(event)
  if (receiveRequest.validate(data, callback)) {
    eventInvoker.send(data)
      .then(function () {
        httpRoute.render('receive-success', data, callback)
        utilityLog.success('Successfully queued email')
      })
      .catch(function (error) {
        httpRoute.render('receive-error', data, callback)
        utilityLog.error(['Error adding to the database', data, error], callback)
      })
  }
}
