import { Database, IPaginationInit, KnexExtra } from '../../apps/knex';
import { tables } from '../../configs';

export const list = async () => {
  return await Database(tables.histories)
    .select(
      'histories.id',
      'histories.notes',

      'users.name',
      'users.phone_number'
    )
    .innerJoin(tables.users, 'users.id', 'histories.id_user');
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
    sort: ['histories.id', 'histories.created_at'],
    filter: {
      search: ['histories.identity', 'histories.ip_address'],
      date_range: ['histories.created_at'],
    },
  };

  const query = Database(tables.histories).innerJoin(
    tables.users,
    'users.id',
    'histories.id_user'
  );
  const extra = new KnexExtra(query);
  return await extra
    .search(init.filter.search, search)
    .orderBy(init.sort, sort_by, order_by)
    .filter(filter, init.filter)
    .paginate(
      // format data per row
      ['histories.id', 'histories.notes', 'users.name', 'users.phone_number'],
      parseInt(show),
      parseInt(page),
      2
    );
};
