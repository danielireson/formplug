const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Response = require('./Response')

describe('Response', function () {
  it('should build a JSON response', function () {
    const testSubject = new Response(200, 'message')
    return testSubject.buildJson()
      .then(function (response) {
        let expected = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            statusCode: 200,
            message: 'message'
          })
        }
        assert.deepEqual(response, expected)
      })
  })

  it('should build a HTML response', function () {
    const testSubject = new Response(200, 'message')
    const template = '<html><body>{{ message }}</body></html>'
    return testSubject.buildHtml(template)
      .then(function (response) {
        let expected = {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/html'
          },
          body: '<html><body>message</body></html>'
        }
        assert.deepEqual(response, expected)
      })
  })

  it('should build a redirect response', function () {
    const testSubject = new Response(301, 'Redirecting')
    const redirectUrl = 'http://example.com'
    return testSubject.buildRedirect(redirectUrl)
      .then(function (response) {
        let expected = {
          statusCode: 301,
          headers: {
            'Content-Type': 'text/plain',
            'Location': 'http://example.com'
          },
          body: 'Redirecting'
        }
        assert.deepEqual(response, expected)
      })
  })
})
