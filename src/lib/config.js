const config = require("../../config.json");

module.exports.getRequiredConfig = (key, defaultValue) => {
  const value = config[key];

  if (value === undefined || value === "") {
    if (defaultValue === undefined) {
      throw new Error(`Required config not found: ${key}`);
    } else {
      return defaultValue;
    }
  }

  return value;
};

module.exports.getOptionalConfig = (key) => {
  const value = config[key];

  return value;
};
