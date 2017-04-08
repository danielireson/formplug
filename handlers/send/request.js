'use strict'

const encryption = require('../../lib/database/encryption')

module.exports.getParams = function (event) {
  let eventData = event.Records[0].dynamodb.NewImage
  return {
    id: eventData.id.S,
    data: encryption.decryptObject(eventData.data.S)
  }
}
