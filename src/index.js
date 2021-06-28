const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");
const fetch = require("node-fetch");
const aws = require("aws-sdk");
const ses = new aws.SES();
const { getRequiredConfig, getOptionalConfig } = require("./lib/config");

module.exports.handler = require("./handler")({
  config: {
    ENCRYPTION_KEY: getRequiredConfig("ENCRYPTION_KEY"),
    SENDER_ARN: getRequiredConfig("SENDER_ARN"),
    SENDER: getRequiredConfig("SENDER", "Formplug"),
    WHITELISTED_RECIPIENTS: getOptionalConfig("WHITELISTED_RECIPIENTS"),
    MSG_SUBJECT: getRequiredConfig("MSG_SUBJECT", "You have a form submission"),
    MSG_RECEIVE_SUCCESS: getRequiredConfig(
      "MSG_RECEIVE_SUCCESS",
      "Form submission successfully made"
    ),
  },
  isValidRecaptcha: (req) => {
    const secretKey = getOptionalConfig("RECAPTCHA_SECRET_KEY");

    if (!secretKey) {
      return Promise.resolve(true);
    }

    const fetchParams = new URLSearchParams();
    fetchParams.append("secret", secretKey);
    fetchParams.append("response", req.recaptcha);
    fetchParams.append("remoteip", req.sourceIp);

    return fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: fetchParams,
    })
      .then((res) => res.json())
      .then((data) => data.success ?? false);
  },
  sendEmail: (email) => {
    return ses.sendEmail(email).promise();
  },
  loadTemplate: () => {
    const customFilePath = path.resolve(__dirname, "templates/custom.html");
    const defaultFilePath = path.resolve(__dirname, "templates/default.html");

    const filePath = fs.existsSync(customFilePath)
      ? customFilePath
      : defaultFilePath;

    return fs.promises.readFile(filePath).then((file) => file.toString());
  },
});
