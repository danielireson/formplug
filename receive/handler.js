var querystring = require('querystring')

var database = require('./database')
var validate = require('./validate')
var render = require('./render')

module.exports.handle = (event, context, callback) => {
  var data = querystring.parse(event.body)
  validate.all(data, callback)

  database.put(data, function() {

  })
}
