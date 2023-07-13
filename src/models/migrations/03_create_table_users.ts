import { Knex } from 'knex';

import { tables, user_roles } from '../../configs';
import * as encryption from '../../utils/encryption';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tables.users, function (table) {
    table.increments();
    table.string('name').notNullable();
    table.string('img_avatar').nullable();

    // Auth
    table.string('username').unique().notNullable();
    table.string('phone_number').notNullable();
    table.string('password').notNullable();

    table.string('role').defaultTo(user_roles.basic).notNullable();
    table.datetime('activity_at').defaultTo(null); // update on hit anything endpoint (middleware)

    // OTP
    table.string('otp_secret').nullable(); // it's same activation_key
    table.string('otp_code').nullable();
    table.integer('otp_count').defaultTo(0);
    table.datetime('otp_start_date').nullable();
    table.boolean('is_verify').defaultTo(false);

    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(null).nullable();
    table.boolean('is_block').defaultTo(false);

    table.boolean('is_reset_password').defaultTo(false); // if only approval forgot password

    //-> Indexing
    table.index(['username', 'password'], 'credential_login');
    table.index(['id', 'role'], 'token_validation_used');
  });

  await knex(tables.users).insert([
    {
      id: 1,
      name: 'Superman',
      img_avatar: 'superman.jpg',

      username: 'superman',
      phone_number: '082214252455',
      password: encryption.encode('adaajadeh'),
      role: user_roles.superadmin
    },
    {
      id: 2,
      name: 'Admin',
      img_avatar: 'admin.jpg',

      username: 'admin',
      phone_number: '082281162571',
      password: encryption.encode('akhsiyap'),
      role: user_roles.admin
    },
    {
      id: 3,
      name: 'Tester Mobile',
      img_avatar: 'tester.jpg',

      username: 'tester-mobile',
      phone_number: '082285469899',
      password: encryption.encode('akhsiyap'),
      role: user_roles.basic
    }
  ]);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tables.users);
}
