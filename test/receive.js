const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const receive = require('../receive/handler')
const event = require('../events/receive-success-json.json')

describe('receive', function () {
  describe('success', function () {
    it('json', function () {
      let response = receive.handle(event, null, callback)
    })
  })
})

function callback () {
  return 'called'
}
