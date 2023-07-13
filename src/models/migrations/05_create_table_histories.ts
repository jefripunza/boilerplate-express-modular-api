import { Knex } from 'knex';

import { tables } from '../../configs';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tables.histories, function (table) {
    table.increments();

    table
      .integer('id_user')
      .unsigned()
      .nullable()
      .references('id')
      .inTable(tables.users);

    table.text('notes').notNullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
  });

  await knex(tables.histories).insert([
    {
      notes: 'First create system!',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tables.histories);
}
