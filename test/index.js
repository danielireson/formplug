const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')

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
const eventReceiveSuccess = require('../events/receive-success.json')
const eventReceiveSuccessJson = require('../events/receive-success-json.json')
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
})

describe('receive', function () {
  var spy, stub
  beforeEach(function () {
    spy = sinon.spy(response, 'build')
    stub = sinon.stub(database, 'put').callsFake((data, callback) => callback())
  })
  afterEach(function () {
    spy.restore()
    stub.restore()
  })
  describe('success', function () {
    it('html', function () {
      receiveHttpResponseAssert('receive-success', eventReceiveSuccess, spy)
    })
    it('json', function () {
      receiveHttpResponseAssert('receive-success', eventReceiveSuccessJson, spy)
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
  })
})

function encryptHttpResponseAssert (type, event, spy) {
  let data = encryptRequest.getParams(event)
  encryptHandler.handle(event, {}, sinon.stub())
  data['_encrypted'] = encryption.encrypt(data['_email'])
  httpResponseAssert(data, type, event, spy)
}

function receiveHttpResponseAssert (type, event, spy) {
  let data = receiveRequest.getParams(event)
  receiveHandler.handle(event, {}, sinon.stub())
  httpResponseAssert(data, type, event, spy)
}

function httpResponseAssert (data, type, event, spy) {
  let routeDetails = route.getRouteDetails(type, data)
  assert(spy.calledOnce)
  let result = spy.firstCall.returnValue
  assert.equal(result.statusCode, routeDetails.statusCode)
  let expectedContentType = data['_format'] === 'json' ? 'application/json' : 'text/html'
  assert.equal(result.headers['Content-Type'], expectedContentType)
  assert.include(result.body, routeDetails.message)
}
