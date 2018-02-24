const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const Response = require('./Response')

describe('Response', function () {
  it('should build a JSON response', function () {
    const testSubject = new Response(200, 'message')
    const json = testSubject.buildJson()
    assert.deepEqual(json, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        statusCode: 200,
        message: 'message'
      })
    })
  })

  it('should build a HTML response', function () {
    const testSubject = new Response(200, 'message')
    const html = testSubject.buildHtml('<html><body>{{ message }}</body></html>')
    assert.deepEqual(html, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: '<html><body>message</body></html>'
    })
  })

  it('should build a redirect response', function () {
    const testSubject = new Response(301, 'Redirecting')
    const redirect = testSubject.buildRedirect('http://example.com')
    assert.deepEqual(redirect, {
      statusCode: 301,
      headers: {
        'Content-Type': 'text/plain',
        'Location': 'http://example.com'
      },
      body: 'Redirecting'
    })
  })
})
