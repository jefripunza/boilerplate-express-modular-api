const { tables } = require("../../config");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.blocks, function (table) {
    table.increments();

    table.string("identity").unique().notNullable();
    table.string("ip_address").notNullable();

    table.datetime("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.blocks);
};
