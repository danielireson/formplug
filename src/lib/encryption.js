const crypto = require("crypto");

const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const tagPosition = saltLength + ivLength;
const inputPosition = tagPosition + tagLength;

module.exports.encrypt = (input, encryptionKey) => {
  try {
    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(saltLength);
    const key = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, "sha512");
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(input, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, encrypted]).toString("hex");
  } catch (error) {
    return "";
  }
};

module.exports.decrypt = (output, encryptionKey) => {
  try {
    const stringValue = Buffer.from(output, "hex");
    const salt = stringValue.slice(0, saltLength);
    const iv = stringValue.slice(saltLength, tagPosition);
    const tag = stringValue.slice(tagPosition, inputPosition);
    const encrypted = stringValue.slice(inputPosition);
    const key = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, "sha512");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final("utf8");
  } catch (error) {
    return "";
  }
};
