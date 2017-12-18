module.exports = {
    "extends": ["standard"],
    "plugins": [
        "standard",
        "promise",
        "node"
    ],
    "rules": {
      "no-useless-return": 0,
      "node/no-unsupported-features": ["error", {
          "version": 6
      }]
    }
};