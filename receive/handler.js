var querystring = require('querystring')

var database = require('./database')
var validate = require('./validate')

module.exports.handle = (event, context, callback) => {
  var data = querystring.parse(event.body)
  validate.all(data, callback)

  database.put(data, function() {

  })
}
