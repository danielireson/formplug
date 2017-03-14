var querystring = require('querystring')

var database = require('./database')
var validate = require('./validate')
var response = require('./response')

module.exports.handle = (event, context, callback) => {
  var data = querystring.parse(event.body)
  validate.all(data, callback)

  database.put(data, function (error) {
    if (error) {
      response.render('error', callback)
    }

    if (validate.hasRedirect(data)) {
      response.redirect(data['redirect-to'], callback)
    }

    response.render('success', callback)
  })
}
