const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const HtmlResponse = require("./HtmlResponse");

describe("HtmlResponse", function () {
  it("should build a HTML response", function () {
    const testSubject = new HtmlResponse(
      200,
      "message",
      "<html><body>{{ message }}</body></html>"
    );

    const response = testSubject.build();

    assert.deepEqual(response, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: "<html><body>message</body></html>",
    });
  });
});
