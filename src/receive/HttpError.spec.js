const describe = require('mocha').describe
const it = require('mocha').it
const assert = require('chai').assert

const HttpError = require('./HttpError')

describe('HttpError', function () {
  it('should support the BAD_REQUEST response type', function () {
    const testSubject = new HttpError().badRequest('error message')
    assert.strictEqual(testSubject.statusCode, 400)
    assert.strictEqual(testSubject.message, 'error message')
  })

  it('should support the FORBIDDEN response type', function () {
    const testSubject = new HttpError().forbidden('error message')
    assert.strictEqual(testSubject.statusCode, 403)
    assert.strictEqual(testSubject.message, 'error message')
  })

  it('should support the NOT_FOUND response type', function () {
    const testSubject = new HttpError().notFound('error message')
    assert.strictEqual(testSubject.statusCode, 404)
    assert.strictEqual(testSubject.message, 'error message')
  })

  it('should support the UNPROCESSABLE_ENTITY response type', function () {
    const testSubject = new HttpError().unprocessableEntity('error message')
    assert.strictEqual(testSubject.statusCode, 422)
    assert.strictEqual(testSubject.message, 'error message')
  })

  it('should support the INTERNAL_SERVER_ERROR response type', function () {
    const testSubject = new HttpError().internalServerError('error message')
    assert.strictEqual(testSubject.statusCode, 500)
    assert.strictEqual(testSubject.message, 'error message')
  })

  it('should support the BAD_GATEWAY response type', function () {
    const testSubject = new HttpError().badGateway('error message')
    assert.strictEqual(testSubject.statusCode, 502)
    assert.strictEqual(testSubject.message, 'error message')
  })
})
