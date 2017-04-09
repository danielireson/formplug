const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')
const sinonStubPromise = require('sinon-stub-promise')
sinonStubPromise(sinon)

const database = require('../lib/database/database')
const encryption = require('../lib/database/encryption')
const route = require('../lib/http/route')
const response = require('../lib/http/response')
const encryptHandler = require('../handlers/encrypt/handler')
const encryptRequest = require('../handlers/encrypt/request')
const receiveHandler = require('../handlers/receive/handler')
const receiveRequest = require('../handlers/receive/request')

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
    spy = sinon.spy(response, 'build')
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
    spy = sinon.spy(response, 'build')
    stub = sinon.stub(database, 'put').returnsPromise()
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
          '_to': encryption.encryptString('johndoe@example.com')
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
    it('database put', function () {
      stub.rejects('error saving to the databse')
      receiveHttpResponseAssert('receive-error', eventReceiveSuccess, spy)
    })
  })
})

function encryptHttpResponseAssert (type, event, spy) {
  let data = encryptRequest.getParams(event)
  encryptHandler.handle(event, {}, sinon.stub())
  if ('_email' in data) data['_encrypted'] = encryption.encryptString(data['_email'])
  httpResponseAssert(data, type, event, spy)
}

function receiveHttpResponseAssert (type, event, spy) {
  let data = receiveRequest.getParams(event)
  receiveHandler.handle(event, {}, sinon.stub())
  httpResponseAssert(data, type, event, spy)
}

function httpResponseAssert (data, type, event, spy) {
  let routeDetails = route.getRouteDetails(type, data)
  assert(!spy.notCalled, 'response build has not been called')
  assert(spy.calledOnce, 'response build called more than once')
  let result = spy.firstCall.returnValue
  assert.equal(result.statusCode, routeDetails.statusCode, 'status codes do not match')
  let expectedContentType = data['_format'] === 'json' ? 'application/json' : 'text/html'
  assert.equal(result.headers['Content-Type'], expectedContentType, 'content type header does not match')
  assert.include(result.body, routeDetails.message, 'response body does not include expected message')
}
