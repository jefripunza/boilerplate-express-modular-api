import { Database } from '../../apps/knex';
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
