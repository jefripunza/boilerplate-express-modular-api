const path = require("path");

const { project_root } = require("./paths");

require("dotenv").config({
  path: path.join(project_root, ".env"),
});
exports.NODE_ENV = process.env.NODE_ENV;
exports.isProduction = String(this.NODE_ENV).includes("production");
exports.isDevelopment = String(this.NODE_ENV).includes("development");
exports.isLocal = ![this.isDevelopment, this.isProduction].includes(true);

exports.APP_NAME = process.env.APP_NAME;
exports.APP_VERSION = process.env.APP_VERSION;
exports.APP_DESCRIPTION = process.env.APP_DESCRIPTION;
let APP_SCHEMES = process.env.APP_SCHEMES;
/**
 * @type {string[]}
 */
exports.APP_SCHEMES = APP_SCHEMES
  ? String(APP_SCHEMES).toLowerCase().split("|")
  : ["http", "https"];
exports.CONTACT_NAME = process.env.CONTACT_NAME;
exports.CONTACT_EMAIL = process.env.CONTACT_EMAIL;
exports.PORT = process.env.PORT;
exports.TZ = process.env.TZ ?? "Asia/Jakarta";

// Database
exports.DB_TYPE = process.env.DB_TYPE;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_PORT = process.env.DB_PORT;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASS = process.env.DB_PASS;
exports.DB_NAME = process.env.DB_NAME;

// Security
exports.SECRET_KEY = process.env.SECRET_KEY;
exports.JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;
exports.JWT_EXPIRED_TOKEN = process.env.JWT_EXPIRED_TOKEN;

// Reporter
exports.REPORT_ERROR_URL = process.env.REPORT_ERROR_URL;
exports.REPORT_BUSINESS_URL = process.env.REPORT_BUSINESS_URL;
exports.REPORT_BEARER_TOKEN = process.env.REPORT_BEARER_TOKEN;
exports.REPORT_GROUP_ID = process.env.REPORT_GROUP_ID;

// File Uploader
exports.max_file_upload_size = 100; // MB
exports.max_upload_image = 3; // MB
exports.allow_file_extension_image = [".jpg", ".jpeg", ".png"];

exports.user_roles = {
  // developer
  superadmin: "superadmin",

  // administrator
  admin: "admin",

  // user
  basic: "basic", // register
};

exports.tables = {
  blocks: "blocks",
  settings: "settings",
  users: "users",
  user_address: "user_address", // users: one to many
  histories: "histories",
};
