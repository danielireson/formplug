var querystring = require('querystring')

var database = require('./database')
var validate = require('./validate')
var response = require('./response')

module.exports.handle = (event, context, callback) => {
  var data = querystring.parse(event.body)
  validate.all(data, callback)

  database.put(data, function (error) {
    if (error) {
      callback(null, response.render('error'))
      process.exit()
    }

    if (validate.hasRedirect(data)) {
      callback(null, response.render('redirect', data['redirect-to']))
      process.exit()
    }

    callback(null, response.render('success'))
    process.exit()
  })
}
