const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const Request = require("./Request");
const UnprocessableEntityError = require("../error/UnprocessableEntityError");
const ForbiddenError = require("../error/ForbiddenError");
const BadRequestError = require("../error/BadRequestError");
const { encrypt } = require("../lib/encryption");

describe("Request", function () {
  const encryptionKey = "testing";

  it("should set the response format to 'html' by default", function () {
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

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.responseFormat, "html");
  });

  it("should set the response format to 'json' if the query string has 'format=json'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: "json",
      },
      body: "",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.responseFormat, "json");
  });

  it("should reject a query string response format that isn't 'json' or 'html'", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(
      error.message,
      "Invalid response format in the query string"
    );
  });

  it("should return true when the query string has 'format=json'", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {
        format: "json",
      },
      body: "",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.ok(testSubject.isJsonResponse());
  });

  it("should get user parameters from request body", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "one=var1&two=var2&three=var3",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.body, {
      one: "var1",
      two: "var2",
      three: "var3",
    });
  });

  it("should parse the 'to' recipient", function () {
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

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.recipients.to, "johndoe@example.com");
  });

  it("should parse an encrypted 'to' recipient", function () {
    const toEmail = encrypt("johndoe@example.com", encryptionKey);
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: `_to=${toEmail}`,
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.recipients.to, "johndoe@example.com");
  });

  it("should reject an invalid 'to' recipient", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Invalid '_to' recipient");
  });

  it("should parse 'replyTo' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_replyTo=johndoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.replyTo, ["johndoe@example.com"]);
  });

  it("should parse encrypted 'replyTo' recipients", function () {
    const replyToEmail = encrypt("johndoe@example.com", encryptionKey);
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: `_replyTo=${replyToEmail}`,
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.replyTo, ["johndoe@example.com"]);
  });

  it("should reject an invalid 'replyTo' recipient", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Invalid email in '_replyTo' field");
  });

  it("should parse 'cc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_cc=johndoe%40example.com;janedoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.cc, [
      "johndoe@example.com",
      "janedoe@example.com",
    ]);
  });

  it("should parse encrypted 'cc' recipients", function () {
    const ccEmail = encrypt("johndoe@example.com", encryptionKey);
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: `_to=johndoe%40example.com&_cc=${ccEmail}`,
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.cc, ["johndoe@example.com"]);
  });

  it("should reject an invalid 'cc' recipient", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Invalid email in '_cc' field");
  });

  it("should parse the 'bcc' recipients", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_bcc=johndoe%40example.com;janedoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.bcc, [
      "johndoe@example.com",
      "janedoe@example.com",
    ]);
  });

  it("should parse encrypted 'bcc' recipients", function () {
    const bccEmail = encrypt("johndoe@example.com", encryptionKey);
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: `_to=johndoe%40example.com&_bcc=${bccEmail}`,
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    assert.deepEqual(testSubject.recipients.bcc, ["johndoe@example.com"]);
  });

  it("should reject an invalid 'bcc' recipient", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Invalid email in '_bcc' field");
  });

  it("should not check for whitelisted emails by default", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate(null);

    assert.strictEqual(error, undefined);
  });

  it("should reject a non-whitelisted email in a single email field", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate(["janedoe@example.com"]);

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Non-whitelisted email in '_to' field");
  });

  it("should reject a non-whitelisted email in a delimetered email field", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_cc=janedoe%40example.com",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate(["johndoe@example.com"]);

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Non-whitelisted email in '_cc' field");
  });

  it("should reject validation if the honeypot field has been filled", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, ForbiddenError);
  });

  it("should validate a redirect URL", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_redirect=http%3A%2F%2Fexample.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.strictEqual(error, undefined);
    assert.strictEqual(testSubject.redirect, "http://example.com");
  });

  it("should reject an invalid redirect URL", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Invalid website URL in '_redirect'");
  });

  it("should return true when there is a redirect URL", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&_redirect=http%3A%2F%2Fexample.com&testing=true",
      requestContext: {
        identity: {
          sourceIp: "127.0.0.1",
        },
      },
    };

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.strictEqual(error, undefined);
    assert.ok(testSubject.isRedirectResponse());
  });

  it("should reject validation when there is no custom parameters", function () {
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

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, UnprocessableEntityError);
    assert.strictEqual(error.message, "Expected at least one custom field");
  });

  it("should reject validation when there is no source ip", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_to=johndoe%40example.com&testing=true",
    };

    const testSubject = new Request(event, encryptionKey);

    const error = testSubject.validate();

    assert.instanceOf(error, BadRequestError);
    assert.strictEqual(error.message, "Expected request to include source ip");
  });

  it("should get the recaptcha from the request", function () {
    const event = {
      pathParameters: {},
      queryStringParameters: {},
      body: "_recaptcha=abc",
    };

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.recaptcha, "abc");
  });

  it("should get the source ip from the request", function () {
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

    const testSubject = new Request(event, encryptionKey);

    assert.strictEqual(testSubject.sourceIp, "127.0.0.1");
  });
});
