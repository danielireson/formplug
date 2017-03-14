var crypto = require('crypto')

var config = require('../config.json')

module.exports.encrypt = function (text) {
  var cipher = crypto.createCipher('aes-256-ctr', config.ENCRYPTION_KEY)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

module.exports.decrypt = function (crypted) {
  var decipher = crypto.createDecipher('aes-256-ctr', config.ENCRYPTION_KEY)
  var text = decipher.update(crypted, 'hex', 'utf8')
  text += decipher.final('utf8')
  return text
}
