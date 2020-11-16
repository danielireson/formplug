class JsonResponse {
  constructor(statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
  }

  build() {
    return {
      statusCode: this.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statusCode: this.statusCode,
        message: this.message,
      }),
    };
  }
}

module.exports = JsonResponse;
