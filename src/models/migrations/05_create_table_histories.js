const { tables } = require("../../config");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(tables.histories, function (table) {
    table.increments();

    table
      .integer("id_user")
      .unsigned()
      .nullable()
      .references("id")
      .inTable(tables.users);

    table.text("notes").notNullable();

    table.datetime("created_at").defaultTo(knex.fn.now());
  });

  await knex(tables.histories).insert([
    {
      notes: "First create system!",
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.histories);
};
