'use strict'

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')

const config = require('../../config.json')
const encryption = require('./encryption')

module.exports.put = function (data, callback) {
  let payload = {
    id: uuid.v4(),
    data: encryption.encrypt(data)
  }
  return docClient.put({TableName: config.TABLE_NAME, Item: payload}, (error) => callback(error))
}

module.exports.delete = function (id, callback) {
  let deleteRequest = {
    TableName: config.TABLE_NAME,
    Key: {id}
  }
  return docClient.delete(deleteRequest, (error) => callback(error))
}
