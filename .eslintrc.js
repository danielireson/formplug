module.exports = {
    "extends": ["standard"],
    "plugins": [
        "standard",
        "promise",
        "node"
    ],
    "rules": {
      "node/no-unsupported-features": ["error", {
          "version": 4
      }]
    }
};