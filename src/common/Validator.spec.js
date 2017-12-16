const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Validator = require('./Validator')

describe('Validator', function () {
  it('should validate an email address', function () {
    assert.isTrue(Validator.isEmail('johndoe@example.com'))
  })

  it('should require emails have a username', function () {
    assert.isNotTrue(Validator.isEmail('@example'))
  })

  it('should require emails have a domain', function () {
    assert.isNotTrue(Validator.isEmail('johndoe'))
  })

  it('should require emails have a tld', function () {
    assert.isNotTrue(Validator.isEmail('johndoe.example'))
  })

  it('should allow emails with a full stop', function () {
    assert.isTrue(Validator.isEmail('john.doe@example.com'))
  })

  it('should allow emails with a dash', function () {
    assert.isTrue(Validator.isEmail('john-doe@example.com'))
  })

  it('should allow emails with a plus sign', function () {
    assert.isTrue(Validator.isEmail('john+doe@example.com'))
  })

  it('should allow emails with uppercase letters', function () {
    assert.isTrue(Validator.isEmail('jOhNdOe@eXaMpLe.com'))
  })

  it('should not allow emails with a space', function () {
    assert.isNotTrue(Validator.isEmail('john doe@example.com'))
  })

  it('should validate a http website', function () {
    assert.isTrue(Validator.isWebsite('http://example.com'))
  })

  it('should validate a https website', function () {
    assert.isTrue(Validator.isWebsite('https://example.com'))
  })

  it('should validate a website without a protocol', function () {
    assert.isTrue(Validator.isWebsite('example.com'))
  })

  it('should require a website domain', function () {
    assert.isNotTrue(Validator.isWebsite('https://'))
  })

  it('should require a website tld', function () {
    assert.isNotTrue(Validator.isWebsite('https://example'))
  })
})
