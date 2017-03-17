'use strict'

const crypto = require('crypto')

const config = require('../config.json')

module.exports.encrypt = function (text) {
  let cipher = crypto.createCipher('aes-256-ctr', config.ENCRYPTION_KEY)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

module.exports.decrypt = function (crypted) {
  let decipher = crypto.createDecipher('aes-256-ctr', config.ENCRYPTION_KEY)
  let text = decipher.update(crypted, 'hex', 'utf8')
  text += decipher.final('utf8')
  return text
}
