const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const InternalServerError = require("./InternalServerError");

describe("InternalServerError", function () {
  it("should instantiate as expected", function () {
    const testSubject = new InternalServerError("testing");

    assert.strictEqual(testSubject.message, "testing");
    assert.strictEqual(testSubject.statusCode, 500);
  });
});
