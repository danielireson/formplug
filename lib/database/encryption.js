'use strict'

const crypto = require('crypto')

const config = require('../../config.json')

module.exports.encryptObject = function (obj) {
  return encrypt(JSON.stringify(obj))
}

module.exports.encryptString = function (str) {
  return encrypt(str)
}

module.exports.decryptObject = function (str) {
  let decrypted = decrypt(str)
  return JSON.parse(decrypted)
}

module.exports.decryptString = function (str) {
  return decrypt(str)
}

function encrypt (dataString) {
  let cipher = crypto.createCipher('aes-256-ctr', config.ENCRYPTION_KEY)
  let crypted = cipher.update(dataString, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (crypted) {
  let decipher = crypto.createDecipher('aes-256-ctr', config.ENCRYPTION_KEY)
  let text = decipher.update(crypted, 'hex', 'utf8')
  text += decipher.final('utf8')
  return text
}
