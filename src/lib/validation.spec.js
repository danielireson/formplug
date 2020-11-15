const describe = require('mocha').describe
const it = require('mocha').it
const fc = require('fast-check')

const validation = require('./validation')

describe('validation', function () {
  it("should accept any valid http(s) URL", function () {
    fc.assert(
      fc.property(
        fc.webUrl({
          validSchemes: ['http', 'https'],
          withFragments: true,
          withQueryParameters: true
        }),
        function (url) {
          return validation.isWebsite(url)
        }
      )
    )
  })

  it("should reject any valid non-http(s) URL", function () {
    fc.assert(
      fc.property(
        fc.webUrl({
          validSchemes: ['ftp', 'gopher', 'file']
        }),
        function (url) {
          return !validation.isWebsite(url)
        }
      )
    )
  })
})
