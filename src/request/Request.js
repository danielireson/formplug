const querystring = require("querystring");
const { isEmail, isURL } = require("validator");
const ForbiddenError = require("../error/ForbiddenError");
const UnprocessableEntityError = require("../error/UnprocessableEntityError");
const BadRequestError = require("../error/BadRequestError");
const encryption = require("../lib/encryption");

const SINGLE_EMAIL_FIELDS = ["_to"];
const DELIMETERED_EMAIL_FIELDS = ["_cc", "_bcc", "_replyTo"];

class Request {
  constructor(event, encryptionKey) {
    this.body = querystring.parse(event.body);
    this.recipients = this._recipients(encryptionKey);
    this.redirect = this.body?._redirect;
    this.recaptcha = this.body?._recaptcha;
    this.responseFormat = event?.queryStringParameters?.format ?? "html";
    this.sourceIp = event?.requestContext?.identity?.sourceIp;
  }

  validate(whitelistedRecipients) {
    if ("_honeypot" in this.body && this.body._honeypot !== "") {
      return new ForbiddenError();
    }

    if (this.responseFormat !== "json" && this.responseFormat !== "html") {
      return new UnprocessableEntityError(
        "Invalid response format in the query string"
      );
    }

    if (this.recipients.to === "") {
      return new UnprocessableEntityError("Invalid '_to' recipient");
    }

    for (const field of SINGLE_EMAIL_FIELDS) {
      if (field in this.body) {
        const email = this.recipients[field.substring(1)].toLowerCase();

        if (!isEmail(email)) {
          return new UnprocessableEntityError(
            `Invalid email in '${field}' field`
          );
        }

        if (whitelistedRecipients && !whitelistedRecipients.includes(email)) {
          return new UnprocessableEntityError(
            `Non-whitelisted email in '${field}' field`
          );
        }
      }
    }

    for (const field of DELIMETERED_EMAIL_FIELDS) {
      if (field in this.body) {
        const emails = this.recipients[field.substring(1)].map((e) =>
          e.toLowerCase()
        );

        if (emails.some((e) => !isEmail(e))) {
          return new UnprocessableEntityError(
            `Invalid email in '${field}' field`
          );
        }

        if (
          whitelistedRecipients &&
          emails.some((e) => !whitelistedRecipients.includes(e))
        ) {
          return new UnprocessableEntityError(
            `Non-whitelisted email in '${field}' field`
          );
        }
      }
    }

    if (
      this.redirect &&
      !isURL(this.redirect, { protocols: ["http", "https"] })
    ) {
      return new UnprocessableEntityError("Invalid website URL in '_redirect'");
    }

    const customParameters = Object.keys(this.body).filter((param) => {
      return param.substring(0, 1) !== "_";
    });

    if (customParameters.length < 1) {
      return new UnprocessableEntityError(`Expected at least one custom field`);
    }

    if (!this.sourceIp) {
      return new BadRequestError("Expected request to include source ip");
    }
  }

  isJsonResponse() {
    return this.responseFormat === "json";
  }

  isRedirectResponse() {
    return this.redirect != null;
  }

  _recipients(encryptionKey) {
    const recipients = {
      to: "",
      cc: [],
      bcc: [],
      replyTo: [],
    };

    SINGLE_EMAIL_FIELDS.forEach((field) => {
      if (field in this.body) {
        const potentialEmail = this.body[field];

        if (isEmail(potentialEmail)) {
          recipients[field.substring(1)] = potentialEmail;
        } else {
          const decryptedPotentialEmail = encryption.decrypt(
            potentialEmail,
            encryptionKey
          );
          recipients[field.substring(1)] = decryptedPotentialEmail;
        }
      }
    });

    DELIMETERED_EMAIL_FIELDS.forEach((field) => {
      if (field in this.body) {
        const potentialEmails = this.body[field].split(";");

        potentialEmails.forEach((potentialEmail) => {
          if (isEmail(potentialEmail)) {
            recipients[field.substring(1)].push(potentialEmail);
          } else {
            const decryptedPotentialEmail = encryption.decrypt(
              potentialEmail,
              encryptionKey
            );
            recipients[field.substring(1)].push(decryptedPotentialEmail);
          }
        });
      }
    });

    return recipients;
  }
}

module.exports = Request;
