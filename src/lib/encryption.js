const crypto = require("crypto");

module.exports.encrypt = (input, encryptionKey) => {
  try {
    let cipher = crypto.createCipher("aes-256-ctr", encryptionKey);
    let crypted = cipher.update(input, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  } catch (e) {
    return "";
  }
};

module.exports.decrypt = (input, encryptionKey) => {
  try {
    let decipher = crypto.createDecipher("aes-256-ctr", encryptionKey);
    let text = decipher.update(input, "hex", "utf8");
    text += decipher.final("utf8");
    return text;
  } catch (e) {
    return "";
  }
};
