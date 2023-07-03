import { Database } from '../../apps/knex';
import { tables } from '../../config';

export const list = async () => {
  return await Database.from(tables.blocks).execute();
};

export const whereIdentity = async (identity: string) => {
  return await Database.from(tables.blocks)
    .where('identity', identity)
    .first()
    .execute();
};

export const whereIP = async (ip_address: string) => {
  return await Database.from(tables.blocks)
    .where('ip_address', ip_address)
    .first()
    .execute();
};

export const whereIdentityOrIpIsBlocked = async (
  identity: string,
  ip_address: string
) => {
  return await Database.from(tables.blocks)
    .where('is_block', true)
    .whereCallback((qb) => {
      qb.where('identity', identity).orWhere('ip_address', ip_address);
    })
    .first()
    .execute();
};

interface IInsert {
  identity: string;
  ip_address: string;
}
export const insert = async (data: IInsert) => {
  await Database.from(tables.blocks)
    .insert({
      identity: data.identity,
      ip_address: data.ip_address
    })
    .execute();
};

export const isBlockExist = async (id_block: string) => {
  return await Database.from(tables.blocks)
    .where('id', id_block)
    .first()
    .execute();
};

export const remove = async (id_block: string) => {
  await Database.from(tables.blocks).where('id', id_block).delete().execute();
};
