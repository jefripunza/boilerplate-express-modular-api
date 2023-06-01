const jwt = require("jsonwebtoken");

const { JWT_SECRET_TOKEN, JWT_EXPIRED_TOKEN } = require("../config");

/**
 * @param {object} object
 * @returns {string}
 */
exports.createToken = (object) => {
  return jwt.sign(object, JWT_SECRET_TOKEN, {
    expiresIn: JWT_EXPIRED_TOKEN,
  });
};

/**
 * @param {string} token
 * @returns {{ data?:{}, error?:number, message?:string }}
 */
exports.verifyToken = (token) => {
  if (token) {
    return jwt.verify(token, JWT_SECRET_TOKEN, (err, data) => {
      if (err) {
        return {
          error: 401,
          message: "Not Authorized",
        };
      }
      return {
        data,
      };
    });
  }
  return {
    error: 403,
    message: "Authorization Bearer is required!",
  };
};
