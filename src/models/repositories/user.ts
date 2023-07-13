import { Database } from '../../apps/knex';
import { tables } from '../../configs';

import * as encryption from '../../utils/encryption';

export const init = async (id_user: number) => {
  return await Database(tables.users)
    .select(
      'users.name',
      'users.img_avatar',
      'users.phone_number',
      'users.role'
    )
    .where('users.id', id_user)
    .first();
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
    name: data.name
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
      otp_count: last_otp_count + 1 // increase...
    });
};

export const logoutClearActivity = async (id_user: number) => {
  await Database(tables.users).where('id', id_user).update({
    activity_at: null
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
