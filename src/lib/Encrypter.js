const crypto = require('crypto')

class Encrypter {
  constructor (encryptionKey) {
    this.encryptionKey = encryptionKey
  }

  encrypt (input) {
    this._validateEncryptionKey()

    let cipher = crypto.createCipher('aes-256-ctr', this.encryptionKey)
    let crypted = cipher.update(input, 'utf8', 'hex')
    crypted += cipher.final('hex')

    return crypted
  }

  decrypt (input) {
    this._validateEncryptionKey()

    let decipher = crypto.createDecipher('aes-256-ctr', this.encryptionKey)
    let text = decipher.update(input, 'hex', 'utf8')
    text += decipher.final('utf8')

    return text
  }

  _validateEncryptionKey () {
    if (this.encryptionKey == null || this.encryptionKey === '') {
      throw new Error('Invalid encryption key')
    }
  }
}

module.exports = Encrypter
