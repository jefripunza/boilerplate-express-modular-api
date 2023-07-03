import { Knex } from "knex";

import { tables } from "../config";

export async function up(knex: Knex): Promise<void> {
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
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tables.user_address);
}
