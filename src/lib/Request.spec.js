const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Request = require('./Request')

describe('Request', function () {
  it('should parse path parameters', function () {
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

  it('should parse query string parameters', function () {
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

  it('should parse user parameters from request body', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: 'one=var1&two=var2&three=var3'
    }
    const testSubject = new Request(event)
    assert.deepEqual(testSubject.userParameters, {one: 'var1', two: 'var2', three: 'var3'})
  })
})
