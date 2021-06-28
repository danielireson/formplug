const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const Request = require("./Request");
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

    assert.strictEqual(testSubject.redirect, "http://example.com");
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

    assert.ok(testSubject.isRedirectResponse());
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
