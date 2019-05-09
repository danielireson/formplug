const options = require('../../config.json')

module.exports.getValue = key => {
  const value = options[key]

  if (!value || value === '') {
    throw new Error(`unable to load ${key} config value`)
  }

  return value
}

module.exports.getValueWithDefault = (key, defaultValue) => {
  const value = options[key]

  if (!value || value === '') {
    return defaultValue
  }

  return value
}
