class HtmlResponse {
  constructor(statusCode, message, template) {
    this.statusCode = statusCode;
    this.headers = {
      "Content-Type": "text/html",
    };
    this.body = template.replace(/{{ message }}/g, message);
  }
}

module.exports = HtmlResponse;
