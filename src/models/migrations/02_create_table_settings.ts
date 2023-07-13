import { Knex } from 'knex';

import { tables } from '../../configs';
import { Swagger } from '../../environments';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tables.settings, function (table) {
    table.increments();

    table.string('key').unique().notNullable();
    table.text('value').notNullable();

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(null).nullable();
  });

  await knex(tables.settings).insert([
    {
      key: 'app_name',
      value: Swagger.APP_NAME
    }
  ]);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tables.settings);
}
