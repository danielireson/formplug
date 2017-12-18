const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Encrypter = require('../common/Encrypter')
const Request = require('./Request')

describe('Request', function () {
  const encrypter = new Encrypter('testing')

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
    const testSubject = new Request(event, encrypter)
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
    const testSubject = new Request(event, encrypter)
    assert.deepEqual(testSubject.queryStringParameters, event.queryStringParameters)
  })

  it("should set the response format to 'html' by default", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: ''
    }
    const testSubject = new Request(event, encrypter)
    assert.strictEqual(testSubject.responseFormat, 'html')
  })

  it("should set the response format to 'json' if the query string has 'format=json'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: 'json'
      },
      body: '_to=johndoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.strictEqual(testSubject.responseFormat, 'json')
      })
  })

  it("should reject a query string response format that isn't 'json' or 'html'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: 'invalid'
      },
      body: '_to=johndoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, 'Invalid response format in the query string')
      })
  })

  it('should get user parameters from request body', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: 'one=var1&two=var2&three=var3'
    }
    const testSubject = new Request(event, encrypter)
    assert.deepEqual(testSubject.userParameters, {one: 'var1', two: 'var2', three: 'var3'})
  })

  it("should parse the 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
      })
  })

  it("should parse an encrypted 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
      })
  })

  it("should reject an invalid 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_to' field")
      })
  })

  it("should reject validation on a missing 'to' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: ''
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Please provide a recipient in '_to' field")
      })
  })

  it("should parse the 'replyTo' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_replyTo=johndoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.replyTo, ['johndoe@example.com'])
      })
  })

  it("should parse an encrypted 'replyTo' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_replyTo=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.replyTo, ['johndoe@example.com'])
      })
  })

  it("should reject an invalid 'replyTo' recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_replyTo=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_replyTo' field")
      })
  })

  it("should parse the 'cc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=johndoe%40example.com;janedoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com', 'janedoe@example.com'])
      })
  })

  it("should parse encrypted 'cc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com'])
      })
  })

  it("should reject an invalid 'cc' recipient as the first recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_cc' field")
      })
  })

  it("should reject an invalid 'cc' recipient as the second recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_cc=johndoe%40example.com;janedoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_cc' field")
      })
  })

  it("should parse the 'bcc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=johndoe%40example.com;janedoe%40example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com', 'janedoe@example.com'])
      })
  })

  it("should parse encrypted 'bcc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com'])
      })
  })

  it("should reject an invalid 'bcc' recipient as the first recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_bcc' field")
      })
  })

  it("should reject an invalid 'cc' recipient as the second recipient", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_bcc=johndoe%40example.com;janedoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected with error')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid email in '_bcc' field")
      })
  })

  it('should reject validation if the honeypot field has been filled', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_honeypot=testing'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected with error')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 403)
        assert.strictEqual(error.message, 'You shall not pass')
      })
  })

  it('should validate a redirect URL', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_redirect=http%3A%2F%2Fexample.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.strictEqual(testSubject.redirectUrl, 'http://example.com')
      })
  })

  it('should reject an invalid redirect URL', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe%40example.com&_redirect=invalid'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected with error')
      })
      .catch(function (error) {
        assert.strictEqual(error.statusCode, 422)
        assert.strictEqual(error.message, "Invalid website URL in '_redirect'")
      })
  })
})
