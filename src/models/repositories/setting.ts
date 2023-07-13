import { Database } from '../../apps/knex';
import { tables } from '../../configs';

export const list = async () => {
  return await Database(tables.settings);
};

export const isKeyExist = async (key: string) => {
  return await Database(tables.settings).where('key', key).first();
};

interface IInsert {
  key: string;
  value: string;
}
export const insert = async (data: IInsert) => {
  await Database(tables.settings).insert({
    key: data.key,
    value: data.value
  });
};

export const update = async (key: string, value: string) => {
  await Database(tables.settings).where('key', key).update({
    value
  });
};
