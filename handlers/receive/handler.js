'use strict'

const httpEncryption = require('../../lib/http/encryption')
const eventInvoker = require('../../lib/event/invoker')
const utilityLog = require('../../lib/utility/log')
const httpRoute = require('../../lib/http/route')
const receiveRequest = require('./request')

module.exports.handle = (event, context, callback) => {
  let data = receiveRequest.getParams(event)
  if (receiveRequest.isValid(data, callback)) {
    if (receiveRequest.hasEncryptedToEmail(data)) data['_to'] = httpEncryption.decrypt(data['_to'])
    eventInvoker.send(data)
      .then(() => utilityLog.success('Successfully queued email'))
      .then(() => httpRoute.render('receive-success', data, callback))
      .catch(function (error) {
        httpRoute.render('receive-error', data, callback)
        utilityLog.error(['Error adding to the database', data, error])
      })
  }
}
