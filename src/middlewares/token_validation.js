const express = require("express");

const jwt = require("../utils/jsonwebtoken");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
module.exports = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.cookies.token;
    if (!token) {
      return res.status(403).json({
        message: "Authorization is required!",
      });
    }
    token = String(token).replace("Bearer ", "");

    const { error, message, data } = jwt.verifyToken(token);
    if (error) {
      return res.status(error).json({
        message,
      });
    }

    // check expired
    const now = new Date();
    const exp = data.exp * 1000; // ms
    const exp_warning = new Date(exp);
    exp_warning.setDate(exp_warning.getDate() - 2); // - 2 hari sebelum token tewas
    // exp_warning.setMinutes(exp_warning.getMinutes() - 5); // - 5 menit sebelum token tewas (dev)
    if (now.getTime() >= exp_warning.getTime()) {
      // new token on header
      token = jwt.createToken({
        id: data.id,
        role: data.role,
      });
      res.set("x-new-token", token);
      res.cookie("token", token, {
        httpOnly: true,
      });
    }

    req.user = data;
    return next();
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
};
