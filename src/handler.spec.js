const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;

describe("handler", function () {
  const config = {
    ENCRYPTION_KEY: "encryptionKey",
    SENDER_ARN:
      "arn:aws:ses:eu-west-1:123456789123:identity/sender@example.com",
    SENDER: "Sender",
    MSG_SUBJECT: "Subject",
    MSG_RECEIVE_SUCCESS: "Received",
    WHITELISTED_RECIPIENTS: [
      "test@example.com",
      "johndoe@example.com",
      "janedoe@example.com",
    ],
  };

  const sendEmailSuccess = (email) => Promise.resolve(email);
  const sendEmailFailure = (error) => Promise.reject(error).catch(() => {});

  const loadTemplateSuccess = () =>
    Promise.resolve("<!DOCTYPE html><html><body>{{ message }}</body></html>");
  const loadTemplateFailure = (error) => Promise.reject(error).catch(() => {});

  const isValidRecaptchaSuccess = (success) => Promise.resolve(success);
  const isValidRecaptchaFailure = (error) =>
    Promise.reject(error).catch(() => {});

  it("should return successful html response", async function () {
    // given
    const event = {
      body: "_to=test%40example.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Received</body></html>",
    });
  });

  it("should return successful json response", async function () {
    // given
    const event = {
      queryStringParameters: {
        format: "json",
      },
      body: "_to=test%40example.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: '{"statusCode":200,"message":"Received"}',
    });
  });

  it("should return successful redirect response", async function () {
    // given
    const event = {
      body: "_to=test%40example.com&_redirect=http%3A%2F%2Fexample.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 302,
      headers: {
        "Content-Type": "text/plain",
        Location: "http://example.com",
      },
      body: "Received",
    });
  });

  it("should return successful plain text response", async function () {
    // given
    const event = {
      body: "_to=test%40example.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateFailure(new Error("testing")),
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "Received",
    });
  });

  it("should return 400 response when no source ip", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&testing=true",
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 400,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Expected request to include source ip</body></html>",
    });
  });

  it("should return 403 response when recaptcha validation fails", async function () {
    // given
    const event = {};

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: () => isValidRecaptchaSuccess(false),
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 403,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Form submission failed recaptcha</body></html>",
    });
  });

  it("should return 500 response when recaptcha validation throws an error", async function () {
    // given
    const event = {};

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaFailure(new Error("testing")),
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>An unexpected error occurred</body></html>",
    });
  });

  it("should return 403 response when honeypot validation fails", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_honeypot=testing",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 403,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body></body></html>",
    });
  });

  it("should return 422 response when query string response format isn't 'json' or 'html'", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: "invalid",
      },
      body: "_to=johndoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid response format in the query string</body></html>",
    });
  });

  it("should return 422 response when invalid 'to' recipient", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid '_to' recipient</body></html>",
    });
  });

  it("should return 422 response when invalid 'replyTo' recipient", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_replyTo=johndoe",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid email in '_replyTo' field</body></html>",
    });
  });

  it("should return 422 response when invalid 'cc' recipient", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_cc=johndoe",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid email in '_cc' field</body></html>",
    });
  });

  it("should return 422 response when invalid 'bcc' recipient", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_bcc=johndoe",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid email in '_bcc' field</body></html>",
    });
  });

  it("should return 422 response when using non-whitelisted email in delimetered email field", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_cc=invalid%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Non-whitelisted email in '_cc' field</body></html>",
    });
  });

  it("should return 422 response when using non-whitelisted email in single email field", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=invalid%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Non-whitelisted email in '_to' field</body></html>",
    });
  });

  it("should return 422 response when invalid redirect URL", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_redirect=invalid",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Invalid website URL in '_redirect'</body></html>",
    });
  });

  it("should return 422 response when no custom fields", async function () {
    // given
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailSuccess,
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 422,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>Expected at least one custom field</body></html>",
    });
  });

  it("should return 500 response when email sending fails", async function () {
    // given
    const event = {
      body: "_to=test%40example.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    // when
    const response = await require("./handler")({
      config,
      isValidRecaptcha: isValidRecaptchaSuccess,
      sendEmail: sendEmailFailure(new Error("testing")),
      loadTemplate: loadTemplateSuccess,
    })(event);

    // then
    assert.deepEqual(response, {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<!DOCTYPE html><html><body>An unexpected error occurred</body></html>",
    });
  });
});
