import { Knex } from 'knex';

import { tables } from '@/configs';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tables.blocks, function (table) {
    table.increments();

    table.string('identity').unique().notNullable();
    table.string('ip_address').notNullable();

    table.boolean('is_block').defaultTo(false);

    table.datetime('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tables.blocks);
}
