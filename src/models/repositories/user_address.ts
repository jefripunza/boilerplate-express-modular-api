import { Database } from '../../apps/knex';
import { tables } from '../../configs';

export const list = async (id_user: number) => {
  return await Database(tables.user_address)
    .where('id_user', id_user)
    .orderBy('is_use', 'asc');
};

export const isSubdistrictExist = async (
  id_user: number,
  subdistrict_code: string
) => {
  return await Database(tables.user_address)
    .where('id_user', id_user)
    .where('subdistrict_code', subdistrict_code)
    .first();
};

export const isAddressExist = async (
  id_user: number,
  id_user_address: number
) => {
  return await Database(tables.user_address)
    .where('id_user', id_user)
    .where('id', id_user_address)
    .first();
};

interface ISchema {
  id_user?: number;

  subdistrict_code?: string;
  detail?: string;
  is_use?: boolean;
}
export const insert = async (data: ISchema) => {
  await Database(tables.user_address).insert({
    id_user: data.id_user,

    subdistrict_code: data.subdistrict_code,
    detail: data.detail,
    is_use: data.is_use
  });
};
export const update = async (
  id_user: number,
  id_user_address: number,
  data: ISchema
) => {
  await Database(tables.user_address)
    .where('id_user', id_user)
    .where('id', id_user_address)
    .update({
      subdistrict_code: data.subdistrict_code,
      detail: data.detail
    });
};

export const changeMain = async (id_user: number, id_user_address: number) => {
  // reset
  await Database(tables.user_address).where('id_user', id_user).update({
    is_use: false
  });

  // focus
  await Database(tables.user_address)
    .where('id_user', id_user)
    .where('id', id_user_address)
    .update({
      is_use: true
    });
};
export const remove = async (id_user: number, id_user_address: number) => {
  await Database(tables.user_address)
    .where('id_user', id_user)
    .where('id', id_user_address)
    .delete();
};
