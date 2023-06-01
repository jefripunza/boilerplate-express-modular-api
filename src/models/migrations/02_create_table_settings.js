const { tables, APP_NAME } = require("../../config");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(tables.settings, function (table) {
    table.increments();

    table.string("key").unique().notNullable();
    table.text("value").notNullable();

    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("updated_at").defaultTo(null).nullable();
  });

  await knex(tables.settings).insert([
    {
      key: "app_name",
      value: APP_NAME,
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.settings);
};
