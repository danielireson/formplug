const { isEmail, isURL } = require("validator");
const Email = require("./email/Email");
const Request = require("./request/Request");
const HttpError = require("./error/HttpError");
const ForbiddenError = require("./error/ForbiddenError");
const UnprocessableEntityError = require("./error/UnprocessableEntityError");
const BadRequestError = require("./error/BadRequestError");
const JsonResponse = require("./response/JsonResponse");
const HtmlResponse = require("./response/HtmlResponse");
const RedirectResponse = require("./response/RedirectResponse");
const PlainTextResponse = require("./response/PlainTextResponse");
const logging = require("./lib/logging");

module.exports = (container) => async (event) => {
  const request = new Request(event, container.config.ENCRYPTION_KEY);

  try {
    await validateRequest(
      request,
      container.config.WHITELISTED_RECIPIENTS,
      container.isValidRecaptcha
    );

    await sendEmail(
      request,
      container.config.SENDER,
      container.config.SENDER_ARN,
      container.config.MSG_SUBJECT,
      container.sendEmail
    );

    return await successResponse(
      request,
      container.config.MSG_RECEIVE_SUCCESS,
      container.loadTemplate
    );
  } catch (error) {
    logging.error("error was caught while executing receive lambda", error);
    return await errorResponse(request, error, container.loadTemplate);
  }
};

async function validateRequest(request, whitelist, recaptchaFn) {
  const isValidRecaptcha = await recaptchaFn(request);

  if (!isValidRecaptcha) {
    throw new ForbiddenError("Form submission failed recaptcha");
  }

  if ("_honeypot" in request.body && request.body._honeypot !== "") {
    throw new ForbiddenError();
  }

  if (request.responseFormat !== "json" && request.responseFormat !== "html") {
    throw new UnprocessableEntityError(
      "Invalid response format in the query string"
    );
  }

  if (request.recipients.to === "") {
    throw new UnprocessableEntityError("Invalid '_to' recipient");
  }

  ["_to"].forEach((field) => {
    if (field in request.body) {
      const email = request.recipients[field.substring(1)].toLowerCase();

      if (!isEmail(email)) {
        throw new UnprocessableEntityError(`Invalid email in '${field}' field`);
      }

      if (whitelist && !whitelist.includes(email)) {
        throw new UnprocessableEntityError(
          `Non-whitelisted email in '${field}' field`
        );
      }
    }
  });

  ["_cc", "_bcc", "_replyTo"].forEach((field) => {
    if (field in request.body) {
      const emails = request.recipients[field.substring(1)].map((e) =>
        e.toLowerCase()
      );

      if (emails.some((e) => !isEmail(e))) {
        throw new UnprocessableEntityError(`Invalid email in '${field}' field`);
      }

      if (whitelist && emails.some((e) => !whitelist.includes(e))) {
        throw new UnprocessableEntityError(
          `Non-whitelisted email in '${field}' field`
        );
      }
    }
  });

  if (
    request.redirect &&
    !isURL(request.redirect, { protocols: ["http", "https"] })
  ) {
    throw new UnprocessableEntityError("Invalid website URL in '_redirect'");
  }

  const customParameters = Object.keys(request.body).filter((param) => {
    return param.substring(0, 1) !== "_";
  });

  if (customParameters.length < 1) {
    throw new UnprocessableEntityError(`Expected at least one custom field`);
  }

  if (!request.sourceIp) {
    throw new BadRequestError("Expected request to include source ip");
  }
}

async function sendEmail(request, sender, senderArn, subject, sendEmailFn) {
  const recipientCount = [].concat(
    request.recipients.cc,
    request.recipients.bcc,
    request.recipients.replyTo
  ).length;

  logging.info(
    `sending to '${request.recipients.to}' and ${recipientCount} other recipients`
  );

  const email = new Email(
    sender,
    senderArn,
    subject,
    request.recipients,
    request.body
  );

  await sendEmailFn(email);
}

async function successResponse(request, msgReceiveSuccess, loadTemplate) {
  if (request.isJsonResponse()) {
    return new JsonResponse(200, msgReceiveSuccess);
  }

  if (request.isRedirectResponse()) {
    return new RedirectResponse(302, msgReceiveSuccess, request.redirect);
  }

  try {
    return new HtmlResponse(200, msgReceiveSuccess, await loadTemplate());
  } catch (error) {
    logging.error("unable to load template file", error);
    return new PlainTextResponse(200, msgReceiveSuccess);
  }
}

async function errorResponse(request, error, loadTemplate) {
  let statusCode = 500;
  let message = "An unexpected error occurred";

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  if (request.isJsonResponse()) {
    return new JsonResponse(statusCode, message);
  }

  try {
    return new HtmlResponse(statusCode, message, await loadTemplate());
  } catch (error) {
    logging.error("unable to load template file", error);
    return new PlainTextResponse(statusCode, message);
  }
}
