const all_characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const otp_characters = "0123456789";

/**
 * @param {number} length
 * @returns {string}
 */
exports.Text = (length = 20) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += all_characters.charAt(
      Math.floor(Math.random() * all_characters.length)
    );
  }
  return result;
};

/**
 * @param {number} length
 * @returns {string}
 */
exports.OTP = (length = 4) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += otp_characters.charAt(
      Math.floor(Math.random() * otp_characters.length)
    );
  }
  return result;
};

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
exports.Integer = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
