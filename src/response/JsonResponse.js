class JsonResponse {
  constructor(statusCode, message) {
    this.statusCode = statusCode;
    this.headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };
    this.body = JSON.stringify({ statusCode, message });
  }
}

module.exports = JsonResponse;
