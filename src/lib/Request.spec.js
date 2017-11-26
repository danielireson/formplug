const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Request = require('./Request')

describe('Request', function () {
  it('should get path parameters', function () {
    const event = {
      pathParameters: {
        one: 'var1',
        two: 'var2',
        three: 'var3'
      },
      queryStringParameters: {},
      body: ''
    }
    const testSubject = new Request(event)
    assert.deepEqual(testSubject.pathParameters, event.pathParameters)
  })

  it('should get query string parameters', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        one: 'var1',
        two: 'var2',
        three: 'var3'
      },
      body: ''
    }
    const testSubject = new Request(event)
    assert.deepEqual(testSubject.queryStringParameters, event.queryStringParameters)
  })

  it('should get user parameters from request body', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: 'one=var1&two=var2&three=var3'
    }
    const testSubject = new Request(event)
    assert.deepEqual(testSubject.userParameters, {one: 'var1', two: 'var2', three: 'var3'})
  })

  it('should get the "to" recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe@example.com'
    }
    const testSubject = new Request(event)
    return testSubject.validate().then(function () {
      assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
    })
  })

  it('should get the the "cc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_cc=johndoe@example.com;janedoe@example.com'
    }
    const testSubject = new Request(event)
    return testSubject.validate().then(function () {
      assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com', 'janedoe@example.com'])
    })
  })

  it('should get the the "bcc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_bcc=johndoe@example.com;janedoe@example.com'
    }
    const testSubject = new Request(event)
    return testSubject.validate().then(function () {
      assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com', 'janedoe@example.com'])
    })
  })
})
