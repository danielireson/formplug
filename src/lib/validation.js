module.exports.isWebsite = string => {
  try {
    new URL(string)
    return true
  } catch (e) {
    // Keeping the regex validation as a fallback to avoid
    // a backwards-incompatible behavior change.
    return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(string)
  }
}

module.exports.isEmail = string => {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(string)
}
