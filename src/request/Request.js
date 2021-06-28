const querystring = require("querystring");
const { isEmail } = require("validator");
const encryption = require("../lib/encryption");

class Request {
  constructor(event, encryptionKey) {
    this.body = querystring.parse(event.body);
    this.recipients = this._recipients(encryptionKey);
    this.redirect = this.body?._redirect;
    this.recaptcha = this.body?._recaptcha;
    this.responseFormat = event?.queryStringParameters?.format ?? "html";
    this.sourceIp = event?.requestContext?.identity?.sourceIp;
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

    ["_to"].forEach((field) => {
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

    ["_cc", "_bcc", "_replyTo"].forEach((field) => {
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
