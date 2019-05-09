const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Encrypter = require('./Encrypter')

describe('Encrypter', function () {
  it('should check the encryption key is not null', function () {
    const encryptionKey = null
    const testSubject = new Encrypter(encryptionKey)
    assert.throws(() => testSubject.encrypt('input'), 'invalid encryption key')
  })

  it('should check the encryption key is not an empty string', function () {
    const encryptionKey = ''
    const testSubject = new Encrypter(encryptionKey)
    assert.throws(() => testSubject.encrypt('input'), 'invalid encryption key')
  })

  it('should encrypt a string', function () {
    const encryptionKey = 'testing'
    const testSubject = new Encrypter(encryptionKey)
    assert.strictEqual(testSubject.encrypt('input'), 'dad26e5692')
  })

  it('should decrypt a string', function () {
    const encryptionKey = 'testing'
    const testSubject = new Encrypter(encryptionKey)
    assert.strictEqual(testSubject.decrypt('929edc80c25fdc3ee8ab63'), '!"£$%^&*()')
  })

  it('should encrypt a string with non-alphanumerical characters', function () {
    const encryptionKey = 'testing'
    const testSubject = new Encrypter(encryptionKey)
    assert.strictEqual(testSubject.encrypt('!"£$%^&*()'), '929edc80c25fdc3ee8ab63')
  })

  it('should decrypt a string with non-alphanumerical characters', function () {
    const encryptionKey = 'testing'
    const testSubject = new Encrypter(encryptionKey)
    assert.strictEqual(testSubject.decrypt('dad26e5692'), 'input')
  })
})
