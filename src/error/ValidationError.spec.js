const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const ValidationError = require("./ValidationError");

describe("ValidationError", function () {
  it("should be instance of Error", function () {
    const testSubject = new ValidationError();

    assert.isOk(testSubject instanceof Error);
  });
});
