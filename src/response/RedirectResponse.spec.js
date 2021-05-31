const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const RedirectResponse = require("./RedirectResponse");

describe("RedirectResponse", function () {
  it("should build a redirect response", function () {
    const testSubject = new RedirectResponse(
      301,
      "Redirecting",
      "http://example.com"
    );

    const response = testSubject.build();

    assert.deepEqual(response, {
      statusCode: 301,
      headers: {
        "Content-Type": "text/plain",
        Location: "http://example.com",
      },
      body: "Redirecting",
    });
  });
});
