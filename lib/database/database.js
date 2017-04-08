'use strict'

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')

const config = require('../../config.json')
const encryption = require('./encryption')

module.exports.put = function (data) {
  let payload = {
    id: uuid.v4(),
    data: encryption.encryptObject(data)
  }
  return docClient.put({TableName: config.TABLE_NAME, Item: payload}).promise()
}

module.exports.delete = function (id) {
  let deleteRequest = {
    TableName: config.TABLE_NAME,
    Key: {id}
  }
  return docClient.delete(deleteRequest).promise()
}
