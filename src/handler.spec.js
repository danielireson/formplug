const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

describe('handler', function () {
  const config = {
    ENCRYPTION_KEY: 'encryptionKey',
    SENDER_ARN: 'arn:aws:ses:eu-west-1:123456789123:identity/sender@example.com',
    SENDER: 'Sender',
    MSG_SUBJECT: 'Subject',
    MSG_RECEIVE_SUCCESS: 'Received'
  }

  const sendEmailSuccess = email => Promise.resolve()
  const sendEmailFailure = error => Promise.reject(error).catch(() => {})

  const loadTemplateSuccess = () => Promise.resolve('<!DOCTYPE html><html><body>{{ message }}</body></html>')
  const loadTemplateFailure = error => Promise.reject(error).catch(() => {})

  const isValidRecaptchaSuccess = success => Promise.resolve(success)
  const isValidRecaptchaFailure = error => Promise.reject(error).catch(() => {})

  it('should return a successful html response', async function () {
    // given
    const event = {
      body: '_to=test%40example.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: '<!DOCTYPE html><html><body>Received</body></html>'
    })
  })

  it('should return a successful json response', async function () {
    // given
    const event = {
      'queryStringParameters': {
        format: 'json'
      },
      body: '_to=test%40example.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: '{\"statusCode\":200,\"message\":\"Received\"}'
    })
  })

  it('should return a successful redirect response', async function () {
    // given
    const event = {
      body: '_to=test%40example.com&_redirect=http%3A%2F%2Fexample.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 302,
      headers: {
        'Content-Type': 'text/plain',
        'Location': 'http://example.com'
      },
      body: 'Received'
    })
  })

  it('should return a 403 response when recaptcha validation fails', async function () {
    // given
    const event = {}

    // when
    const response = await require('./handler')({
      config,
      isValidRecaptcha: () => isValidRecaptchaSuccess(false),
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 403,
      headers: {
        'Content-Type': 'text/html'
      },
      body: "<!DOCTYPE html><html><body>Form submission failed recaptcha</body></html>"
    })
  })

  it('should return a 422 response when request validation fails', async function () {
    // given
    const event = {}

    // when
    const response = await require('./handler')({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        'Content-Type': 'text/html'
      },
      body: "<!DOCTYPE html><html><body>Invalid '_to' recipient</body></html>"
    })
  })

  it('should return a 500 response when email validation fails', async function () {
    // given
    const event = {
      body: '_to=test%40example.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config: {...config, MSG_SUBJECT: null},
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: "<!DOCTYPE html><html><body>Subject is invalid</body></html>"
    })
  })

  it('should return a 500 response when email sending fails', async function () {
    // given
    const event = {
      body: '_to=test%40example.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config: config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailFailure(new Error('testing')),
      loadTemplate: loadTemplateSuccess
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: "<!DOCTYPE html><html><body>An unexpected error occurred</body></html>"
    })
  })

  it('should handle template loading failures', async function () {
    // given
    const event = {
      body: '_to=test%40example.com&testing=true',
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1'
        }
      }
    }

    // when
    const response = await require('./handler')({
      config: config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateFailure(new Error('testing'))
    })(event)

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: "Received"
    })
  })
})
