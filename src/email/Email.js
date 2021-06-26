class Email {
  constructor(sender, senderArn, subject, recipients, params) {
    this.Source = this._source(sender, senderArn);
    this.ReplyToAddresses = recipients.replyTo;
    this.Destination = {
      ToAddresses: [recipients.to],
      CcAddresses: recipients.cc,
      BccAddresses: recipients.bcc,
    };
    this.Message = {
      Subject: {
        Data: subject,
      },
      Body: {
        Text: {
          Data: this._messageBody(params),
        },
      },
    };
  }

  _source(sender, senderArn) {
    const senderArnAsArray = (senderArn ?? "").split("/");
    const email = senderArnAsArray[senderArnAsArray.length - 1];
    return `${sender} <${email}>`;
  }

  _messageBody(requestBody) {
    return Object.keys(requestBody ?? {})
      .filter(function (param) {
        // don't send private variables
        return param.substring(0, 1) !== "_";
      })
      .reduce(function (message, param) {
        // uppercase the field names and add each parameter value
        message += param.toUpperCase() + ": " + requestBody[param] + "\r\n";
        return message;
      }, "");
  }
}

module.exports = Email;
