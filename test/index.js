const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const databaseService = require('../lib/database/service')
const databaseEncryption = require('../lib/database/encryption')
const mailBuilder = require('../lib/mail/builder')
const mailService = require('../lib/mail/service')
const httpRoute = require('../lib/http/route')
const httpResponse = require('../lib/http/response')
const utilityLog = require('../lib/utility/log')

const encryptHandler = require('../handlers/encrypt/handler')
const encryptRequest = require('../handlers/encrypt/request')
const receiveHandler = require('../handlers/receive/handler')
const receiveRequest = require('../handlers/receive/request')
const sendHandler = require('../handlers/send/handler')

const eventEncryptSuccess = require('../events/encrypt-success.json')
const eventEncryptSuccessJson = require('../events/encrypt-success-json.json')
const eventEncryptBadEmail = require('../events/encrypt-bad-email.json')
const eventEncryptNoEmail = require('../events/encrypt-no-email.json')
const eventReceiveSuccess = require('../events/receive-success.json')
const eventReceiveSuccessJson = require('../events/receive-success-json.json')
const eventReceiveSuccessRedirect = require('../events/receive-success-redirect.json')
const eventReceiveBadEmail = require('../events/receive-bad-email.json')
const eventReceiveNoEmail = require('../events/receive-no-email.json')
const eventReceiveHoneypot = require('../events/receive-honeypot.json')

describe('encrypt', function () {
  var spy
  beforeEach(function () {
    spy = sinon.spy(httpResponse, 'build')
  })
  afterEach(function () {
    spy.restore()
  })
  describe('success', function () {
    it('html', function () {
      encryptHttpResponseAssert('encrypt-success', eventEncryptSuccess, spy)
    })
    it('json', function () {
      encryptHttpResponseAssert('encrypt-success', eventEncryptSuccessJson, spy)
    })
  })
  describe('error', function () {
    it('bad email', function () {
      encryptHttpResponseAssert('encrypt-bad-email', eventEncryptBadEmail, spy)
    })
    it('no email', function () {
      encryptHttpResponseAssert('encrypt-no-email', eventEncryptNoEmail, spy)
    })
  })
})

describe('receive', function () {
  var spy, stub
  beforeEach(function () {
    spy = sinon.spy(httpResponse, 'build')
    stub = sinon.stub(databaseService, 'put').returnsPromise()
  })
  afterEach(function () {
    spy.restore()
    stub.restore()
  })
  describe('success', function () {
    it('html', function () {
      stub.resolves()
      receiveHttpResponseAssert('receive-success', eventReceiveSuccess, spy)
    })
    it('json', function () {
      stub.resolves()
      receiveHttpResponseAssert('receive-success', eventReceiveSuccessJson, spy)
    })
    it('encrypted email', function () {
      stub.resolves()
      let event = {
        pathParameters: {
          '_to': databaseEncryption.encryptString('johndoe@example.com')
        }
      }
      receiveHttpResponseAssert('receive-success', event, spy)
    })
    it('redirect', function () {
      stub.resolves()
      receiveHttpResponseAssert('receive-success', eventReceiveSuccessRedirect, spy)
    })
  })
  describe('error', function () {
    it('bad email', function () {
      receiveHttpResponseAssert('receive-bad-email', eventReceiveBadEmail, spy)
    })
    it('no email', function () {
      receiveHttpResponseAssert('receive-no-email', eventReceiveNoEmail, spy)
    })
    it('honeypot', function () {
      receiveHttpResponseAssert('receive-honeypot', eventReceiveHoneypot, spy)
    })
    it('database service', function () {
      stub.rejects('error saving to the databse')
      receiveHttpResponseAssert('receive-error', eventReceiveSuccess, spy)
    })
  })
})

describe('send', function () {
  var mailStub, databaseStub
  var data = {
    _to: 'johndoe@example.com',
    text: 'abc',
    number: '123'
  }
  var event = buildSendEvent(data)
  beforeEach(function () {
    mailStub = sinon.stub(mailService, 'send').returnsPromise()
    databaseStub = sinon.stub(databaseService, 'delete').returnsPromise()
  })
  afterEach(function () {
    mailStub.restore()
    databaseStub.restore()
  })
  describe('success', function () {
    it('email', function () {
      var spy = sinon.spy(mailBuilder, 'build')
      mailStub.resolves()
      databaseStub.resolves()
      let expectedEmail = mailBuilder.build(data)
      sendHandler.handle(event, {}, sinon.stub())
      assert.deepEqual(spy.lastCall.returnValue, expectedEmail, 'email response does not match')
      assert(!databaseStub.notCalled, 'database delete has not been called')
      assert(databaseStub.calledOnce, 'database delete called more than once')
      spy.restore()
    })
  })
  describe('error', function () {
    it('mail service', function () {
      var spy = sinon.spy(utilityLog, 'error')
      mailStub.rejects()
      sendHandler.handle(event, {}, sinon.stub())
      assert(spy.calledOnce, 'error should only be thrown once')
      let actualError = spy.firstCall.args[0][0]
      let expectedError = 'Error sending email'
      assert.equal(actualError, expectedError, 'error format does not match')
      spy.restore()
    })
    it('databse service', function () {
      var spy = sinon.spy(utilityLog, 'error')
      mailStub.resolves()
      databaseStub.rejects()
      sendHandler.handle(event, {}, sinon.stub())
      assert(spy.calledOnce, 'error should only be thrown once')
      let actualError = spy.firstCall.args[0][0]
      let expectedError = 'Error sending email'
      assert.equal(actualError, expectedError, 'error format does not match')
      spy.restore()
    })
  })
})

function encryptHttpResponseAssert (type, event, spy) {
  let data = encryptRequest.getParams(event)
  encryptHandler.handle(event, {}, sinon.stub())
  if ('_email' in data) data['_encrypted'] = databaseEncryption.encryptString(data['_email'])
  httpResponseAssert(data, type, event, spy)
}

function receiveHttpResponseAssert (type, event, spy) {
  let data = receiveRequest.getParams(event)
  receiveHandler.handle(event, {}, sinon.stub())
  httpResponseAssert(data, type, event, spy)
}

function httpResponseAssert (data, type, event, spy) {
  let routeDetails = httpRoute.getRouteDetails(type, data)
  assert(!spy.notCalled, 'response build has not been called')
  assert(spy.calledOnce, 'response build called more than once')
  let result = spy.firstCall.returnValue
  assert.equal(result.statusCode, routeDetails.statusCode, 'status codes do not match')
  let expectedContentType = data['_format'] === 'json' ? 'application/json' : 'text/html'
  assert.equal(result.headers['Content-Type'], expectedContentType, 'content type header does not match')
  assert.include(result.body, routeDetails.message, 'response body does not include expected message')
}

function buildSendEvent (data) {
  return {
    Records: [{
      eventName: 'INSERT',
      dynamodb: {
        NewImage: {
          id: {
            S: '1'
          },
          data: {
            S: databaseEncryption.encryptObject(data)
          }
        }
      }
    }]
  }
}
