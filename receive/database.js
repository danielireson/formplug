var AWS = require('aws-sdk')
var uuid = require('uuid')

var config = require('../config.json')
var encryption = require('../lib/encryption')

module.exports.put = function(form, callback) {
  var docClient = new AWS.DynamoDB.DocumentClient()
  var payload = {
    id: uuid.v4(),
    data: encryption.encrypt(JSON.stringify(form))
  }
  return docClient.put({TableName: config.TABLE_NAME, Item: payload}, callback())
}
