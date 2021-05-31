const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const PlainTextResponse = require("./PlainTextResponse");

describe("PlainTextResponse", function () {
  it("should build a plain text response", function () {
    const testSubject = new PlainTextResponse(200, "message");

    const response = testSubject.build("http://example.com");

    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "message",
    });
  });
});
