const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const UnprocessableEntityError = require("./UnprocessableEntityError");

describe("UnprocessableEntityError", function () {
  it("should instantiate as expected", function () {
    const testSubject = new UnprocessableEntityError("testing");

    assert.strictEqual(testSubject.message, "testing");
    assert.strictEqual(testSubject.statusCode, 422);
  });
});
