'use strict'

const database = require('../../lib/database/database')
const log = require('../../lib/utility/log')
const mail = require('../../lib/mail/mail')
const route = require('../../lib/http/route')
const request = require('./request')

module.exports.handle = (event, context, callback) => {
  if (event.Records[0].eventName === 'INSERT') {
    let params = request.getParams(event)
    mail.send(params.data)
      .then(() => log.success('Successfully sent email'))
      .then(() => database.delete(params.id))
      .then(() => log.success('Successfully deleted queue item'))
      .catch(function (error) {
        route.renderError('Error sending email', params.data, error)
      })
  }
}
