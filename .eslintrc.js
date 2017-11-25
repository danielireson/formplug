module.exports = {
    "extends": ["standard"],
    "plugins": [
        "standard",
        "promise",
        "node"
    ],
    "rules": {
      "prefer-promise-reject-errors": 0,
      "node/no-unsupported-features": ["error", {
          "version": 4
      }]
    }
};