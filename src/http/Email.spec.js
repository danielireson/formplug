const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Email = require('./Email')

describe('Email', function () {
  it('should reject an arn that is incorrectly formatted', function () {
    const testSubject = new Email('arn')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    assert.throws(() => testSubject.build(recipients, userParameters), 'sender ARN is formatted incorrectly')
  })

  it("should reject an arn that doesn't start with 'arn'", function () {
    const testSubject = new Email('other:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    assert.throws(() => testSubject.build(recipients, userParameters), "sender ARN should start with 'arn'")
  })

  it('should reject an arn with an invalid identity length', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    assert.throws(() => testSubject.build(recipients, userParameters), 'sender ARN identity length is invalid')
  })

  it('should reject an arn with an invalid identity email address', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    assert.throws(() => testSubject.build(recipients, userParameters), 'sender ARN identity email address is invalid')
  })

  it('should build the sender source correctly', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {}
    const email = testSubject.build(recipients, userParameters)
    assert.strictEqual(email.Source, 'Formplug <johndoe@example.com>')
  })

  it("should set the 'to' email address correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: 'janedoe@example.com', cc: [], bcc: []}
    const userParameters = {}
    const email = testSubject.build(recipients, userParameters)
    assert.deepEqual(email.Destination.ToAddresses, ['janedoe@example.com'])
  })

  it("should set the 'cc' email addresses correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: ['janedoe@example.com'], bcc: []}
    const userParameters = {}
    const email = testSubject.build(recipients, userParameters)
    assert.deepEqual(email.Destination.CcAddresses, ['janedoe@example.com'])
  })

  it("should set the 'bcc' email address correctly", function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: ['janedoe@example.com']}
    const userParameters = {}
    const email = testSubject.build(recipients, userParameters)
    assert.deepEqual(email.Destination.BccAddresses, ['janedoe@example.com'])
  })

  it('should build the email body correctly', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {one: 'var1', two: 'var2'}
    const email = testSubject.build(recipients, userParameters)
    assert.strictEqual(email.Message.Body.Text.Data, 'ONE: var1\r\nTWO: var2\r\n---\r\nSent with Formplug')
  })

  it('should not add private parameters to the email body', function () {
    const testSubject = new Email('arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com')
    const recipients = {to: '', cc: [], bcc: []}
    const userParameters = {one: 'var1', _two: 'var2'}
    const email = testSubject.build(recipients, userParameters)
    assert.strictEqual(email.Message.Body.Text.Data, 'ONE: var1\r\n---\r\nSent with Formplug')
  })
})
