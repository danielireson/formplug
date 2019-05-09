module.exports.info = message => {
  if (process.env.NODE_ENV !== 'testing') {
    console.log(message)
  }
}

module.exports.error = (message, error) => {
  if (process.env.NODE_ENV !== 'testing') {
    console.error(message)
    if (error) {
      console.error(error)
    }
  }
}
