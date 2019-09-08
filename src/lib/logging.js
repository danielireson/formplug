module.exports.info = message => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(message)
  }
}

module.exports.error = (message, error) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(message)

    if (error) {
      console.error(error)
    }
  }
}
