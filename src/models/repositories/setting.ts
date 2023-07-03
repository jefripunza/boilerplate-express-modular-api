import { Database } from '../../apps/knex';
import { tables } from '../../config';

export const list = async () => {
  return await Database.from(tables.settings).execute();
};

export const isKeyExist = async (key: string) => {
  return await Database.from(tables.settings)
    .where('key', key)
    .first()
    .execute();
};

interface IInsert {
  key: string;
  value: string;
}
export const insert = async (data: IInsert) => {
  await Database.from(tables.settings)
    .insert({
      key: data.key,
      value: data.value
    })
    .execute();
};

export const update = async (key: string, value: string) => {
  await Database.from(tables.settings)
    .where('key', key)
    .update({
      value
    })
    .execute();
};
