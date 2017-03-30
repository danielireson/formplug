const describe = require('mocha').describe
const it = require('mocha').it
const beforeEach = require('mocha').beforeEach
const afterEach = require('mocha').afterEach
const assert = require('chai').assert
const sinon = require('sinon')

const database = require('../lib/storage/database')
const route = require('../lib/http/route')
const receive = require('../handlers/receive/handler')

const eventReceiveSuccess = require('../events/receive-success.json')
const eventReceiveSuccessJson = require('../events/receive-success-json.json')
const eventBadEmail = require('../events/receive-bad-email.json')
const eventNoEmail = require('../events/receive-no-email.json')
const eventHoneypot = require('../events/receive-honeypot.json')

describe('receive', function () {
  var spy, stub
  beforeEach(function () {
    spy = sinon.spy(route, 'render')
    stub = sinon.stub(database, 'put').callsFake((data, callback) => callback())
  })
  afterEach(function () {
    spy.restore()
    stub.restore()
  })
  describe('success', function () {
    it('html', function () {
      routeRenderAssert('receive-success', eventReceiveSuccess, spy)
    })
    it('json', function () {
      routeRenderAssert('receive-success', eventReceiveSuccessJson, spy)
    })
  })
  describe('error', function () {
    it('bad email', function () {
      routeRenderAssert('receive-bad-email', eventBadEmail, spy)
    })
    it('no email', function () {
      routeRenderAssert('receive-no-email', eventNoEmail, spy)
    })
    it('honeypot', function () {
      routeRenderAssert('receive-honeypot', eventHoneypot, spy)
    })
  })
})

function routeRenderAssert (route, event, spy) {
  receive.handle(event, {}, sinon.stub())
  assert(spy.calledOnce)
  assert(spy.calledWith(route))
}
