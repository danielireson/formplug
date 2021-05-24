const Email = require("./email/Email");
const Request = require("./request/Request");
const HttpError = require("./error/HttpError");
const ForbiddenError = require("./error/ForbiddenError");
const JsonResponse = require("./response/JsonResponse");
const HtmlResponse = require("./response/HtmlResponse");
const RedirectResponse = require("./response/RedirectResponse");
const PlainTextResponse = require("./response/PlainTextResponse");
const logging = require("./lib/logging");

const validateRecaptcha = (recaptchaFn) => async (request) => {
  const isValid = await recaptchaFn(request);

  if (!isValid) {
    throw new ForbiddenError("Form submission failed recaptcha");
  }

  return request;
};

const validateRequest = (whitelist) => async (request) => {
  const error = request.validate(whitelist);

  if (error) {
    throw error;
  }

  return request;
};

const sendEmail = (sender, senderArn, subject, mailerFn) => async (request) => {
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

  const serviceError = email.validate();

  if (serviceError) {
    throw serviceError;
  }

  await mailerFn(email);

  return request;
};

const buildSuccessResponse = (message, templateFn) => async (request) => {
  if (request.isJsonResponse()) {
    return new JsonResponse(200, message);
  } else if (request.isRedirectResponse()) {
    return new RedirectResponse(302, message, request.redirect);
  } else {
    try {
      const template = await templateFn();
      return new HtmlResponse(200, message, template);
    } catch (error) {
      logging.error("unable to load template file", error);
      return new PlainTextResponse(200, message);
    }
  }
};

const buildErrorResponse = (isJsonResponse, templateFn) => async (error) => {
  logging.error("error was caught while executing receive lambda", error);

  let statusCode = 500;
  let message = "An unexpected error occurred";

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  if (isJsonResponse) {
    return new JsonResponse(statusCode, message);
  } else {
    try {
      const template = await templateFn();
      return new HtmlResponse(statusCode, message, template);
    } catch (error) {
      logging.error("unable to load template file", error);
      return new PlainTextResponse(statusCode, message);
    }
  }
};

const handleResponse = async (response) => {
  logging.info(`returning http ${response.statusCode} response`);

  return response.build();
};

module.exports = (container) => async (event) => {
  const request = new Request(event, container.config.ENCRYPTION_KEY);

  return Promise.resolve()
    .then(validateRecaptcha(container.isValidRecaptcha))
    .then(validateRequest(container.config.WHITELISTED_RECIPIENTS))
    .then(
      sendEmail(
        container.config.SENDER,
        container.config.SENDER_ARN,
        container.config.MSG_SUBJECT,
        container.sendEmail
      )
    )
    .then(
      buildSuccessResponse(
        container.config.MSG_RECEIVE_SUCCESS,
        container.loadTemplate
      )
    )
    .catch(buildErrorResponse(request.isJsonResponse(), container.loadTemplate))
    .then(handleResponse);
};
