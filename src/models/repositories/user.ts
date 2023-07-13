import { Database, IPaginationInit, KnexExtra } from '@/apps/knex';
import { tables, user_roles } from '@/configs';
import { createPromise } from '@/helpers/async';

import * as encryption from '@/utils/encryption';

const addresses = Database(tables.user_address)
  .select('id_user')
  .select(
    Database.raw(`
    JSON_ARRAYAGG(JSON_OBJECT(
      'id', user_address.id,
      'subdistrict_code', user_address.subdistrict_code,
      'detail', user_address.detail,
      'is_use', user_address.is_use,
      'created_at', user_address.created_at,
      'updated_at', user_address.updated_at
    )) AS addresses
  `)
  )
  .as('user_address_data');

export const init = async (id_user: number) => {
  return await Database(tables.users)
    .select(
      'users.name',
      'users.img_avatar',
      'users.phone_number',
      'users.role',

      Database.raw(
        `CAST(COALESCE(user_address_data.addresses, '[]') AS JSON) AS addresses`
      )
    )
    .leftJoin(addresses, 'users.id', '=', 'user_address_data.id_user')
    .where('users.id', id_user)
    .first();
};

export const paginate = async (
  search: any,
  show: any,
  page: any,
  sort_by: any,
  order_by: any,
  filter: any
) => {
  const init: IPaginationInit = {
    sort: [
      'users.id',

      'users.name',
      'users.phone_number',
      'users.role',

      'users.created_at',
      'users.updated_at',
    ],
    filter: {
      search: ['users.name', 'users.phone_number'],
      boolean: ['users.is_verify', 'users.is_block'],
      date_range: ['users.created_at', 'users.updated_at'],
      enum: ['users.role'],
    },
  };

  const query = Database(tables.users).leftJoin(
    addresses,
    'users.id',
    '=',
    'user_address_data.id_user'
  );

  const extra = new KnexExtra(query);
  const result = await extra
    .search(init.filter.search, search)
    .orderBy(init.sort, sort_by, order_by)
    .filter(filter, init.filter)
    .paginate(
      // format data per row
      [
        'users.id',

        'users.name',
        'users.img_avatar',
        'users.phone_number',
        'users.role',

        Database.raw(
          `CAST(COALESCE(user_address_data.addresses, '[]') AS JSON) AS addresses`
        ),

        'users.is_verify',
        'users.is_block',

        'users.created_at',
        'users.updated_at',
      ],
      parseInt(show),
      parseInt(page),
      2
    );

  // create enum for option
  if (init.filter.enum) {
    init.filter.enum = await createPromise(init.filter.enum, async (column) => {
      return {
        column,
        option: await Database(tables.users)
          .whereNot('users.role', user_roles.superadmin)
          .groupBy(column)
          .pluck(column),
      };
    });
  }

  return { ...result, init };
};

export const isUsernameExist = async (username: string) => {
  return await Database(tables.users)
    .select('is_verify', 'is_block', 'otp_count', 'otp_start_date')
    .where('username', username)
    .first();
};

export const updateByUsername = async (username: string, data: any) => {
  if (data?.password) {
    data.password = encryption.encode(data.password);
  }
  await Database(tables.users).where('username', username).update(data);
};

export const updateByOtpSecret = async (otp_secret: string, data: any) => {
  if (data?.password) {
    data.password = encryption.encode(data.password);
  }
  await Database(tables.users).where('otp_secret', otp_secret).update(data);
};

interface ISchema {
  name?: string;
  username?: string;
  phone_number?: string;
  password?: string;
}
export const insert = async (data: ISchema) => {
  if (data?.password) {
    data.password = encryption.encode(data.password);
  }
  await Database(tables.users).insert(data);
};
export const update = async (id_user: number, data: ISchema) => {
  if (data?.password) {
    data.password = encryption.encode(data.password);
  }
  await Database(tables.users).where('id', id_user).update({
    name: data.name,
  });
};

export const isLogin = async (username: string, password: string) => {
  return await Database(tables.users)
    .select(
      'phone_number',
      'role',
      'is_block',
      'otp_count',
      'otp_start_date',
      'activity_at'
    )
    .where('username', username)
    .where('password', encryption.encode(password))
    .first();
};

export const isOtpSecretExist = async (otp_secret: string) => {
  return await Database(tables.users)
    .select('id', 'username', 'role', 'otp_code', 'otp_count', 'otp_start_date')
    .where('otp_secret', otp_secret)
    .first();
};

export const increaseOtpCount = async (
  otp_secret: string,
  last_otp_count: number
) => {
  await Database(tables.users)
    .where('otp_secret', otp_secret)
    .update({
      otp_count: last_otp_count + 1, // increase...
    });
};

export const logoutClearActivity = async (id_user: number) => {
  await Database(tables.users).where('id', id_user).update({
    activity_at: null,
  });
};

export const findByPasswordAndID = async (
  id_user: number,
  password: string
) => {
  return await Database(tables.users)
    .select('id')
    .where('id', id_user)
    .where('password', encryption.encode(password))
    .first();
};
