const execSync = require('child_process').execSync

const describe = require('mocha').describe
const test = require('mocha').test
const assert = require('chai').assert

describe('Integration tests', function () {
  this.timeout(5000)

  test('success with one recipient', function (done) {
    // given
    const event = './events/receive-success.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 200)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, 'Form submission successfully made')

    done()
  })

  test('success with cc recipients', function (done) {
    // given
    const event = './events/receive-cc.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 200)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, 'Form submission successfully made')

    done()
  })

  test('success with bcc recipients', function (done) {
    // given
    const event = './events/receive-bcc.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 200)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, 'Form submission successfully made')

    done()
  })

  test('success with a json response', function (done) {
    // given
    const event = './events/receive-json.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 200)
    assert.strictEqual(result.headers['Content-Type'], 'application/json')
    assert.strictEqual(result.headers['Access-Control-Allow-Origin'], '*')
    assert.strictEqual(result.body.message, 'Form submission successfully made')

    done()
  })

  test('success with a redirect response', function (done) {
    // given
    const event = './events/receive-redirect.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 302)
    assert.strictEqual(result.headers['Content-Type'], 'text/plain')
    assert.strictEqual(result.headers['Location'], 'http://example.com')
    assert.strictEqual(result.body, 'Form submission successfully made')

    done()
  })

  test('fail with no recipient', function (done) {
    // given
    const event = './events/receive-no-email.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 422)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, "Please provide a recipient in '_to' field")

    done()
  })

  test('fail with an invalid recipient', function (done) {
    // given
    const event = './events/receive-bad-email.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 422)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, "Invalid email in '_to' field")

    done()
  })

  test('fail when the honeypot field is not empty', function (done) {
    // given
    const event = './events/receive-honeypot.json'

    // when
    const output = execSync(`serverless invoke local -f receive -p ${event}`).toString()
    const result = JSON.parse(output)

    // then
    assert.strictEqual(result.statusCode, 403)
    assert.strictEqual(result.headers['Content-Type'], 'text/html')
    assertHtmlElements(result.body, 'You shall not pass')

    done()
  })

  /**
   * Instead of asserting on an exact html response
   * check for expected html elements and the correct message
   */
  function assertHtmlElements (body, message) {
    const htmlElements = [
      '<!DOCTYPE html>', '</html>',
      '<head>', '</head>',
      '<style>', '</style>',
      '<body>', '</body>',
      `<p>${message}</p>`
    ]

    htmlElements.forEach(function (needle) {
      assert.isTrue(body.indexOf(needle) !== -1, `'${needle}' couldn't be found in the response body`)
    })
  }
})
