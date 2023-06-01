const fs = require("fs");
const path = require("path");

exports.project_root = process.cwd();

// ==================================================================
//-> Directory

exports.modules_dir = path.join(this.project_root, "src", "modules");
exports.migrations_dir = path.join(
  this.project_root,
  "src",
  "models",
  "migrations"
);
exports.seeds_dir = path.join(this.project_root, "src", "models", "seeds");

exports.user_dir = path.join(
  this.project_root,
  "assets",
  "public",
  "image",
  "user"
);
if (!fs.existsSync(this.user_dir)) {
  fs.mkdirSync(this.user_dir, { recursive: true });
}

// ==================================================================
//-> File

exports.swagger_json_file = path.join(this.project_root, "swagger.json");
