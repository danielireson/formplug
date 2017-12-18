class Log {
  static info (message) {
    if (process.env.NODE_ENV !== 'testing') {
      console.log(message)
    }
  }

  static error (message, error) {
    if (process.env.NODE_ENV !== 'testing') {
      console.error(message)
      if (error) {
        console.error(error)
      }
    }
  }
}

module.exports = Log
