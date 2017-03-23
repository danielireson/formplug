'use strict'

module.exports.success = function (logs) {
  log('log', logs)
}

module.exports.failure = function (logs) {
  log('error', logs)
}

function log (type, logs) {
  if (typeof logs === 'string') {
    console[type](logs)
  } else {
    logs = logs || []
    logs.forEach(function (log) {
      console[type](log)
    })
  }
}
