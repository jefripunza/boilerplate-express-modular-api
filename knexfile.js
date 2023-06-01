// Update with your config settings.

const {
  DB_TYPE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
} = require("./src/config");
const { migrations_dir, seeds_dir } = require("./src/paths");

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: DB_TYPE,
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },
  useNullAsDefault: true,
  // pool: { min: 0, max: 10 },
  migrations: {
    tableName: "knex_migrations",
    directory: migrations_dir,
  },
  seeds: {
    directory: seeds_dir,
  },
};
