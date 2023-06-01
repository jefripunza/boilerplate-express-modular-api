const crypto = require("crypto");
const { SECRET_KEY } = require("../config");

exports.encode = (text) => {
  // AES256
  const cipher = crypto.createCipher("aes256", SECRET_KEY);
  const layer_1 = cipher.update(text, "utf8", "hex") + cipher.final("hex");

  // BASE64
  return Buffer.from(layer_1).toString("base64"); // last result
};

exports.decode = (encrypted) => {
  // BASE64
  const last_layer = Buffer.from(encrypted, "base64").toString("ascii");

  try {
    // AES256
    const decipher = crypto.createDecipher("aes256", SECRET_KEY);
    return decipher.update(last_layer, "hex", "utf8") + decipher.final("utf8");
  } catch (error) {
    return false;
  }
};
