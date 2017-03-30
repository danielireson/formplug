const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')

const database = require('../lib/storage/database')
const route = require('../lib/http/route')
const response = require('../lib/http/response')
const receiveHandler = require('../handlers/receive/handler')
const receiveRequest = require('../handlers/receive/request')

const eventReceiveSuccess = require('../events/receive-success.json')
const eventReceiveSuccessJson = require('../events/receive-success-json.json')
const eventReceiveBadEmail = require('../events/receive-bad-email.json')
const eventReceiveNoEmail = require('../events/receive-no-email.json')
const eventReceiveHoneypot = require('../events/receive-honeypot.json')

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

function responseAssert (type, event, spy) {
  let data = receiveRequest.getParams(event)
  let routeDetails = route.getRouteDetails(type, data)
  receiveHandler.handle(event, {}, sinon.stub())
  assert(spy.calledOnce)
  let result = spy.firstCall.returnValue
  assert.equal(result.statusCode, routeDetails.statusCode)
  let expectedContentType = data['_format'] === 'json' ? 'application/json' : 'text/html'
  assert.equal(result.headers['Content-Type'], expectedContentType)
  assert.include(result.body, routeDetails.message)
}
