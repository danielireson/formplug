const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const JsonResponse = require("./JsonResponse");

describe("JsonResponse", function () {
  it("should build a JSON response", function () {
    const testSubject = new JsonResponse(200, "message");

    const json = testSubject.build();

    assert.deepEqual(json, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statusCode: 200,
        message: "message",
      }),
    });
  });
});
