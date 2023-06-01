const express = require("express");
const { user_roles } = require("../config");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
module.exports = (req, res, next) => {
  if ([user_roles.superadmin, user_roles.admin].includes(req.user.role)) {
    return next();
  }
  return res.status(401).json({
    message: "Only Admin !!!",
  });
};
