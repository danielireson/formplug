const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')

const database = require('../lib/storage/database')
const encryption = require('../lib/storage/encryption')
const route = require('../lib/http/route')
const response = require('../lib/http/response')
const receiveHandler = require('../handlers/receive/handler')
const receiveRequest = require('../handlers/receive/request')
const encryptHandler = require('../handlers/encrypt/handler')

const eventReceiveSuccess = require('../events/receive-success.json')
const eventReceiveSuccessJson = require('../events/receive-success-json.json')
const eventReceiveBadEmail = require('../events/receive-bad-email.json')
const eventReceiveNoEmail = require('../events/receive-no-email.json')
const eventReceiveHoneypot = require('../events/receive-honeypot.json')
const eventEncryptSuccess = require('../events/encrypt-success.json')
const eventEncryptSuccessJson = require('../events/encrypt-success-json.json')

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
      responseAssert('receive-success', eventReceiveSuccess, spy)
    })
    it('json', function () {
      responseAssert('receive-success', eventReceiveSuccessJson, spy)
    })
  })
  describe('error', function () {
    it('bad email', function () {
      responseAssert('receive-bad-email', eventReceiveBadEmail, spy)
    })
    it('no email', function () {
      responseAssert('receive-no-email', eventReceiveNoEmail, spy)
    })
    it('honeypot', function () {
      responseAssert('receive-honeypot', eventReceiveHoneypot, spy)
    })
  })
})

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
      responseAssert('encrypt-success', eventEncryptSuccess, spy)
    })
    it('json', function () {
      responseAssert('encrypt-success', eventEncryptSuccessJson, spy)
    })
  })
})

function responseAssert (type, event, spy) {
  let data = receiveRequest.getParams(event)
  switch (type.split('-')[0]) {
    case 'receive':
      receiveHandler.handle(event, {}, sinon.stub())
      break
    case 'encrypt':
      encryptHandler.handle(event, {}, sinon.stub())
      data['_encrypted'] = encryption.encrypt(data['_email'])
      break
    default:
      logErrorAndExit('Route not recognised')
  }
  let routeDetails = route.getRouteDetails(type, data)
  assert(spy.calledOnce)
  let result = spy.firstCall.returnValue
  assert.equal(result.statusCode, routeDetails.statusCode)
  let expectedContentType = data['_format'] === 'json' ? 'application/json' : 'text/html'
  assert.equal(result.headers['Content-Type'], expectedContentType)
  assert.include(result.body, routeDetails.message)
}

function logErrorAndExit (error) {
  console.log(error)
  process.exit(1)
}
