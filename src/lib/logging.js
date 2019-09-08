module.exports.info = message => {
  console.log(message)
}

module.exports.error = (message, error) => {
  console.error(message)

  if (error) {
    console.error(error)
  }
}
