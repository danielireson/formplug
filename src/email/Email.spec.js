const describe = require("mocha").describe;
const it = require("mocha").it;
const assert = require("chai").assert;
const Email = require("./Email");
const InternalServerError = require("../error/InternalServerError");

describe("Email", function () {
  it("should reject an arn with an invalid sender", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      null,
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(
      error.message,
      "Source should contain a valid email address"
    );
  });

  it("should reject an invalid subject", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      null,
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Subject is invalid");
  });

  it("should reject an invalid body", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Body is invalid");
  });

  it("should reject an invalid 'to' email address", function () {
    const recipients = { to: "invalid", cc: [], bcc: [], replyTo: [] };
    const userParameters = { one: "var1" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Invalid to recipient: invalid");
  });

  it("should reject an invalid 'cc' email address", function () {
    const recipients = { to: "", cc: ["invalid"], bcc: [], replyTo: [] };
    const userParameters = { one: "var1" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Invalid cc recipient: invalid");
  });

  it("should reject an invalid 'bcc' email address", function () {
    const recipients = { to: "", cc: [], bcc: ["invalid"], replyTo: [] };
    const userParameters = { one: "var1" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Invalid bcc recipient: invalid");
  });

  it("should reject an invalid 'replyTo' email address", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: ["invalid"] };
    const userParameters = { one: "var1" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    const error = testSubject.validate();

    assert.instanceOf(error, InternalServerError);
    assert.strictEqual(error.message, "Invalid reply to recipient: invalid");
  });

  it("should build the sender source correctly", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = {};

    const testSubject = new Email(
      "Formplug",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.strictEqual(testSubject.Source, "Formplug <johndoe@example.com>");
  });

  it("should set the 'to' email address correctly", function () {
    const recipients = {
      to: "janedoe@example.com",
      cc: [],
      bcc: [],
      replyTo: [],
    };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.deepEqual(testSubject.Destination.ToAddresses, [
      "janedoe@example.com",
    ]);
  });

  it("should set the 'cc' email addresses correctly", function () {
    const recipients = {
      to: "",
      cc: ["janedoe@example.com"],
      bcc: [],
      replyTo: [],
    };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.deepEqual(testSubject.Destination.CcAddresses, [
      "janedoe@example.com",
    ]);
  });

  it("should set the 'bcc' email address correctly", function () {
    const recipients = {
      to: "",
      cc: [],
      bcc: ["janedoe@example.com"],
      replyTo: [],
    };
    const userParameters = {};

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.deepEqual(testSubject.Destination.BccAddresses, [
      "janedoe@example.com",
    ]);
  });

  it("should build the email body correctly", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = { one: "var1", two: "var2" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.strictEqual(
      testSubject.Message.Body.Text.Data,
      "ONE: var1\r\nTWO: var2\r\n"
    );
  });

  it("should not add private parameters to the email body", function () {
    const recipients = { to: "", cc: [], bcc: [], replyTo: [] };
    const userParameters = { one: "var1", _two: "var2" };

    const testSubject = new Email(
      "sender",
      "arn:aws:ses:eu-west-1:123456789123:identity/johndoe@example.com",
      "testing",
      recipients,
      userParameters
    );

    assert.strictEqual(testSubject.Message.Body.Text.Data, "ONE: var1\r\n");
  });
});
