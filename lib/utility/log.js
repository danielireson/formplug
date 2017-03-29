'use strict'

module.exports.success = function (logs) {
  log('log', logs)
}

module.exports.error = function (logs) {
  log('error', logs)
}

function log (type, logs) {
  if (process.env.NODE_ENV !== 'testing') {
    if (typeof logs === 'string') {
      console[type](logs)
    } else if (logs instanceof Array) {
      logs.forEach(function (log) {
        console[type](log)
      })
    } else {
      console.error('Logs argument must be string or array')
    }
  }
}
