const config = require('../../config.json')

class ConfigService {
  constructor (config) {
    this.config = config
  }

  getValue (key) {
    const value = this._value(key)

    if (!value || value === '') {
      throw new Error(`unable to load ${key} config value`)
    }

    return value;
  }

  getValueWithDefault (key, defaultValue) {
    const value = this._value(key)

    if (!value || value === '') {
      return defaultValue;
    }

    return value;
  }

  _value (key) {
    return this.config[key]
  }
}

module.exports = new ConfigService(config)
