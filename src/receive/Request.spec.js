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

  it('should get user parameters from request body', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: 'one=var1&two=var2&three=var3'
    }
    const testSubject = new Request(event, encrypter)
    assert.deepEqual(testSubject.userParameters, {one: 'var1', two: 'var2', three: 'var3'})
  })

  it('should parse the "to" recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_to=johndoe@example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.strictEqual(testSubject.recipients.to, 'johndoe@example.com')
      })
  })

  it('should parse an encrypted "to" recipient', function () {
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

  it('reject an invalid "to" recipient', function () {
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
        assert.strictEqual(error.message, "Invalid email in '_to' field")
      })
  })

  it('should parse the "cc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_cc=johndoe@example.com;janedoe@example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com', 'janedoe@example.com'])
      })
  })

  it('should parse encrypted "cc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_cc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.cc, ['johndoe@example.com'])
      })
  })

  it('reject an invalid "cc" recipient as the first recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_cc=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, "Invalid email in '_cc' field")
      })
  })

  it('reject an invalid "cc" recipient as the second recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_cc=johndoe@example.com;janedoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, "Invalid email in '_cc' field")
      })
  })

  it('should parse the "bcc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_bcc=johndoe@example.com;janedoe@example.com'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com', 'janedoe@example.com'])
      })
  })

  it('should parse encrypted "bcc" recipients', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_bcc=d9d3764d8215e758a7fb2b6df34bf94f9ba058'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function () {
        assert.deepEqual(testSubject.recipients.bcc, ['johndoe@example.com'])
      })
  })

  it('reject an invalid "bcc" recipient as the first recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_bcc=johndoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, "Invalid email in '_bcc' field")
      })
  })

  it('reject an invalid "cc" recipient as the second recipient', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_bcc=johndoe@example.com;janedoe'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected with error')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, "Invalid email in '_bcc' field")
      })
  })

  it('reject validation if the honeypot field has been filled', function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: '_honeypot=testing'
    }
    const testSubject = new Request(event, encrypter)
    return testSubject.validate()
      .then(function (resolved) {
        assert.exists(resolved, 'promise should have rejected with error')
      })
      .catch(function (error) {
        assert.strictEqual(error.message, 'You shall not pass')
      })
  })
})
