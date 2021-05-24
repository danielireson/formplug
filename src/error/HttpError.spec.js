const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const HttpError = require("./HttpError");

describe("HttpError", function () {
  it("should be instance of Error", function () {
    const testSubject = new HttpError();

    assert.isOk(testSubject instanceof Error);
  });
});
