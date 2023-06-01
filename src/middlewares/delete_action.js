const express = require("express");

const { Database } = require("../apps/knex");
const { tables } = require("../config");

const encryption = require("../utils/encryption");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns
 */
module.exports = async (req, res, next) => {
  const id_user = req.user.id;
  const { password } = req.query;

  if (!password) {
    return res.status(400).json({
      message: "password require!",
    });
  }

  const isUserMatch = await Database(tables.users)
    .select("id")
    .where("id", id_user)
    .where("password", encryption.encode(password))
    .first();
  if (!isUserMatch) {
    return res.status(401).json({
      message: "wrong password!",
    });
  }

  return next();
};
