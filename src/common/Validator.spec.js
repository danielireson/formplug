const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Validator = require('./Validator')

describe('Validator', function () {
  it('should validate an email address', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isEmail('johndoe@example.com'))
  })

  it('should require emails have a username', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isEmail('@example'))
  })

  it('should require emails have a domain', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isEmail('johndoe'))
  })

  it('should require emails have a tld', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isEmail('johndoe.example'))
  })

  it('should allow emails with a full stop', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isEmail('john.doe@example.com'))
  })

  it('should allow emails with a dash', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isEmail('john-doe@example.com'))
  })

  it('should allow emails with a plus sign', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isEmail('john+doe@example.com'))
  })

  it('should allow emails with uppercase letters', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isEmail('jOhNdOe@eXaMpLe.com'))
  })

  it('should not allow emails with a space', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isEmail('john doe@example.com'))
  })

  it('should validate a http website', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isWebsite('http://example.com'))
  })

  it('should validate a https website', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isWebsite('https://example.com'))
  })

  it('should validate a website without a protocol', function () {
    const testSubject = new Validator()
    assert.isTrue(testSubject.isWebsite('example.com'))
  })

  it('should require a website domain', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isWebsite('https://'))
  })

  it('should require a website tld', function () {
    const testSubject = new Validator()
    assert.isNotTrue(testSubject.isWebsite('https://example'))
  })
})
