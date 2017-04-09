'use strict'

const databaseEncryption = require('../../lib/database/encryption')

module.exports.getParams = function (event) {
  let eventData = event.Records[0].dynamodb.NewImage
  return {
    id: eventData.id.S,
    data: databaseEncryption.decryptObject(eventData.data.S)
  }
}
