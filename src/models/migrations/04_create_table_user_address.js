const { tables } = require("../../config");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.user_address, function (table) {
    table.increments();

    table
      .integer("id_user")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(tables.users)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.string("subdistrict_code").notNullable(); // untuk RAJA ONGKIR (FROM)
    table.string("detail").notNullable();

    table.boolean("is_use").defaultTo(false);

    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("updated_at").defaultTo(null).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.user_address);
};
