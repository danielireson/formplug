const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Request = require('./Request')
const UnprocessableEntityError = require('../error/UnprocessableEntityError')
const ForbiddenError = require('../error/ForbiddenError')

describe('Request', function () {
  const encryptionKey = 'testing'

  it("should set the response format to 'html' by default", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: ''
    }
    const testSubject = new Request(event, encryptionKey)
    assert.strictEqual(testSubject.responseFormat, 'html')
  })

  it("should set the response format to 'json' if the query string has 'format=json'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: 'json'
      },
      body: ''
    }
    const testSubject = new Request(event, encryptionKey)
    assert.strictEqual(testSubject.responseFormat, 'json')
  })

  it("should reject a query string response format that isn't 'json' or 'html'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: 'invalid'
      },
      body: '_to=johndoe%40example.com'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, 'Invalid response format in the query string')
  })

  it('should get user parameters from request body', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: 'one=var1&two=var2&three=var3'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.userParameters, {one: 'var1', two: 'var2', three: 'var3'})
  })

  it("should parse the 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
  })

  it("should parse an encrypted 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
  })

  it("should reject an invalid 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: ''
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, "Invalid '_to' recipient")
  })

  it("should parse 'replyTo' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_replyTo=johndoe%40example.com'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.replyTo, ['johndoe@example.com'])
  })

  it("should parse encrypted 'replyTo' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_replyTo=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.replyTo, ['johndoe@example.com'])
  })

  it("should reject an invalid 'replyTo' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_replyTo=johndoe'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, "Invalid email in '_replyTo' field")
  })

  it("should parse 'cc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=johndoe%40example.com;janedoe%40example.com'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com', 'janedoe@example.com'])
  })

  it("should parse encrypted 'cc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com'])
  })

  it("should reject an invalid 'cc' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=johndoe'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, "Invalid email in '_cc' field")
  })

  it("should parse the 'bcc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=johndoe%40example.com;janedoe%40example.com'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com', 'janedoe@example.com'])
  })

  it("should parse encrypted 'bcc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encryptionKey)
    assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com'])
  })

  it("should reject an invalid 'bcc' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=johndoe'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, "Invalid email in '_bcc' field")
  })

  it('should reject validation if the honeypot field has been filled', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_honeypot=testing'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, ForbiddenError)
  })

  it('should validate a redirect URL', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_redirect=http%3A%2F%2Fexample.com'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.strictEqual(error, undefined)
    assert.strictEqual(testSubject.redirectUrl, 'http://example.com')
  })

  it('should reject an invalid redirect URL', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_redirect=invalid'
    }
    const testSubject = new Request(event, encryptionKey)
    const error = testSubject.validate()
    assert.instanceOf(error, UnprocessableEntityError)
    assert.strictEqual(error.message, "Invalid website URL in '_redirect'")
  })
})
