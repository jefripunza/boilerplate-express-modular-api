import { Database, KnexExtra, IPaginationInit } from '@/apps/knex';
import { tables } from '@/configs';

export const paginate = async (
  search: any,
  show: any,
  page: any,
  sort_by: any,
  order_by: any,
  filter: any
) => {
  const init: IPaginationInit = {
    sort: ['blocks.id', 'blocks.created_at'],
    filter: {
      search: ['blocks.identity', 'blocks.ip_address'],
      date_range: ['blocks.created_at'],
    },
  };

  const query = Database(tables.blocks).select([
    'blocks.id', // foreign key

    'blocks.identity',
    'blocks.ip_address',

    'blocks.created_at',
  ]);
  const extra = new KnexExtra(query);
  return await extra
    .search(init.filter.search, search)
    .orderBy(init.sort, sort_by, order_by)
    .filter(filter, init.filter)
    .paginate(parseInt(show), parseInt(page), 2);
};

export const whereIdentity = async (identity: string) => {
  return await Database(tables.blocks).where('identity', identity).first();
};

export const whereIP = async (ip_address: string) => {
  return await Database(tables.blocks).where('ip_address', ip_address).first();
};

export const whereIdentityOrIpIsBlocked = async (
  identity: string,
  ip_address: string
) => {
  return await Database(tables.blocks)
    .select('is_block')
    .where(function () {
      this.where('identity', identity).orWhere('ip_address', ip_address);
    })
    .first();
};

interface IInsert {
  identity: string;
  ip_address: string;
}
export const insert = async (data: IInsert) => {
  await Database(tables.blocks).insert({
    identity: data.identity,
    ip_address: data.ip_address,
  });
};

export const isBlockExist = async (id_block: string) => {
  return await Database(tables.blocks).where('id', id_block).first();
};

export const remove = async (id_block: string) => {
  await Database(tables.blocks).where('id', id_block).delete();
};
