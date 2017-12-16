const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Email = require('./Email')

describe('Email', function () {
  it('should reject an arn that is incorrectly formatted', function () {
    const testSubject = new Email('arn')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, 'Sender ARN is formatted incorrectly')
      })
  })

  it("should reject an arn that doesn't start with 'arn'", function () {
    const testSubject = new Email('other:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, "Sender ARN should start with 'arn'")
      })
  })

  it('should reject an arn with an invalid identity length', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, 'Sender ARN identity length is invalid')
      })
  })

  it('should reject an arn with an invalid identity email address', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, 'Sender ARN identity email address is invalid')
      })
  })

  it('should build the sender source correctly', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.strictEqual(resolved.Source, 'Formplug <johndoe@example.com>')
      })
  })

  it("should set the 'to' email address correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: 'janedoe@example.com', cc: [], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.deepEqual(resolved.Destination.ToAddresses, ['janedoe@example.com'])
      })
  })

  it("should set the 'cc' email addresses correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: ['janedoe@example.com'], bcc: []}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.deepEqual(resolved.Destination.CcAddresses, ['janedoe@example.com'])
      })
  })

  it("should set the 'bcc' email address correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: ['janedoe@example.com']}
    const userParameters = {}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.deepEqual(resolved.Destination.BccAddresses, ['janedoe@example.com'])
      })
  })

  it('build the email body correctly', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {one: 'var1', two: 'var2'}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.strictEqual(resolved.Message.Body.Text.Data, 'ONE: var1\r\nTWO: var2\r\n---\r\nSent with Formplug')
      })
  })

  it('not add private parameters to the email body', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {one: 'var1', _two: 'var2'}
    return testSubject.build(recipients, userParameters)
      .then(function (resolved) {
        assert.strictEqual(resolved.Message.Body.Text.Data, 'ONE: var1\r\n---\r\nSent with Formplug')
      })
  })
})
