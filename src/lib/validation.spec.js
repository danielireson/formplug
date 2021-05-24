const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;

const validation = require("./validation");

describe("validation", function () {
  it("should accept any valid http(s) URL", function () {
    const validURLs = [
      "example.com",
      "www.example.com",
      "example.com#testing",
      "example.com?q=testing",
    ];

    validURLs.forEach((validURL) => {
      assert.isTrue(validation.isWebsite(`http://${validURL}`));
      assert.isTrue(validation.isWebsite(`https://${validURL}`));
    });
  });

  it("should reject any valid non-http(s) URL", function () {
    assert.isFalse(validation.isWebsite("file://example.com"));
    assert.isFalse(validation.isWebsite("ftp://example.com"));
  });
});
