import { Database, IPaginationInit, KnexExtra } from '@/apps/knex';
import { tables } from '@/configs';

export const list = async () => {
  return await Database(tables.settings);
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
    sort: ['settings.id', 'settings.created_at', 'settings.updated_at'],
    filter: {
      search: ['settings.key', 'settings.value'],
      date_range: ['settings.created_at', 'settings.updated_at'],
    },
  };

  const query = Database(tables.histories);
  const extra = new KnexExtra(query);
  return await extra
    .search(init.filter.search, search)
    .orderBy(init.sort, sort_by, order_by)
    .filter(filter, init.filter)
    .paginate(
      // format data per row
      [
        'settings.id',

        'settings.key',
        'settings.value',

        'settings.created_at',
        'settings.updated_at',
      ],
      parseInt(show),
      parseInt(page),
      2
    );
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
    value: data.value,
  });
};

export const update = async (key: string, value: string) => {
  await Database(tables.settings).where('key', key).update({
    value,
  });
};
