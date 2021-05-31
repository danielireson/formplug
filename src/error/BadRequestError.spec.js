const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const BadRequestError = require("./BadRequestError");

describe("BadRequestError", function () {
  it("should instantiate as expected", function () {
    const testSubject = new BadRequestError("testing");

    assert.strictEqual(testSubject.message, "testing");
    assert.strictEqual(testSubject.statusCode, 400);
  });
});
