const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const ForbiddenError = require("./ForbiddenError");

describe("ForbiddenError", function () {
  it("should instantiate as expected", function () {
    const testSubject = new ForbiddenError("testing");

    assert.strictEqual(testSubject.message, "testing");
    assert.strictEqual(testSubject.statusCode, 403);
  });
});
