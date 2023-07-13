import knex, { Knex } from 'knex';
import { Knex as KnexConfig } from '@/configs';

import {
  isArray,
  isObject,
  isNumber,
  isDateFormat,
} from '@/helpers/validation';

const Database = knex(KnexConfig.config);

const DatabaseConnect = async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  start_server: boolean | Function = false
): Promise<void> => {
  Database.raw('SELECT 1')
    .then(() => {
      // eslint-disable-next-line no-console
      console.info('✈️  Database connected');
      if (start_server && typeof start_server === 'function') start_server();
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('❌ Database not connected', e);
      process.exit(1);
    });
};

interface IPagination {
  data: object[];
  meta: {
    total_data: number;
    current_page: number;
    per_page: number;
    last_page: number;
    margin?: number[];
  };
}

interface IFilterColumnSet {
  search?: string[];
  boolean?: string[];
  boolean_date?: string[];
  enum?: string[];
  date_range?: string[];
}

export interface IPaginationInit {
  sort: string[];
  filter: IFilterColumnSet;
}

class KnexExtra<TRecord extends object = any, TResult = unknown[]> {
  queryBuilder: Knex.QueryBuilder<TRecord, TResult>;

  constructor(queryBuilder: Knex.QueryBuilder<TRecord, TResult>) {
    this.queryBuilder = queryBuilder;
  }

  // ============================================================================================
  // ============================================================================================

  orderBy = (sort: string[], sort_by = 'id', order_by = 'ASC') => {
    if (sort_by) {
      if (!sort.includes(sort_by)) {
        sort_by = sort[0];
      }
    } else {
      sort_by = sort[0];
    }
    order_by = String(order_by).toLowerCase() == 'desc' ? 'DESC' : 'ASC';
    this.queryBuilder.orderBy(sort_by, order_by);

    return this; // next...
  };

  search = (
    column: string | string[] | undefined,
    value: string,
    on_match = false
  ) => {
    if (!column) return this; // skip...
    if (value && value.length > 0) {
      if (typeof column == 'string') {
        this.queryBuilder.where(
          Database.raw(`LOWER(${column})`),
          'LIKE',
          `%${String(value).toLowerCase()}%`
        );
      } else if (isArray(column)) {
        this.queryBuilder.where(function () {
          column.forEach((col) => {
            if (typeof value != 'string') return;
            if (on_match) {
              return this.andWhere(
                Database.raw(`LOWER(${col})`),
                'LIKE',
                `%${String(value).toLowerCase()}%`
              );
            }
            return this.orWhere(
              Database.raw(`LOWER(${col})`),
              'LIKE',
              `%${String(value).toLowerCase()}%`
            );
          });
        });
      }
    }

    return this; // next...
  };

  filter = (filter_query: string, column_set: IFilterColumnSet) => {
    if (!filter_query || typeof filter_query != 'string') return this;
    const filters = filter_query.split(';');
    if (filters.length > 0) {
      if (!isObject(column_set)) {
        throw new Error('bad, column_set on filter not object');
      }

      const focus = {
        search: column_set?.search || [],
        boolean: column_set?.boolean || [],
        boolean_date: column_set?.boolean_date || [],
        enum: column_set?.enum || [],
        date_range: column_set?.date_range || [],
      };

      filters.forEach((filter) => {
        const [column, value] = filter.split(':');

        if (focus.search.length > 0 && focus.search.includes(column)) {
          // ex: my love...
          this.search(column, value, true);
        }

        if (focus.boolean.length > 0 && focus.boolean.includes(column)) {
          // ex: true / false
          let value_result = false;
          if (String(value).toLowerCase() == 'true') {
            value_result = true;
          }
          if (typeof value == 'boolean')
            this.queryBuilder.andWhere(column, value_result);
        }

        if (
          focus.boolean_date.length > 0 &&
          focus.boolean_date.includes(column)
        ) {
          // ex: true / false
          if (String(value).toLowerCase() == 'true') {
            this.queryBuilder.andWhereNot(column, null);
          } else if (String(value).toLowerCase() == 'false') {
            this.queryBuilder.andWhere(column, null);
          }
        }

        if (focus.enum.length > 0 && focus.enum.includes(column)) {
          // ex: pending / success
          this.queryBuilder.andWhere(column, value);
        }

        if (focus.date_range.length > 0 && focus.date_range.includes(column)) {
          // ex: 2023-01-01>2023-12-31
          if (!String(value).includes('>')) return;
          const [start, end] = String(value).split('>');
          if (isDateFormat(start) && isDateFormat(end)) {
            this.queryBuilder.andWhereBetween(column, [
              new Date(start),
              new Date(end),
            ]);
          }
        }
      });
    }

    return this; // next...
  };

  paginate = (
    show_column: any[],
    per_page = 10,
    page = 1,
    margin = 0
  ): Promise<IPagination> => {
    // fine value
    if (!per_page || !isNumber(per_page) || per_page <= 0) {
      per_page = 10; // default
    }
    if (!page || !isNumber(page) || page <= 0) {
      page = 1; // default
    }
    const useMargin = margin && margin != 0;
    if (useMargin) {
      if (typeof margin != 'number') {
        margin = 3;
      } else {
        if (margin < 1) {
          margin = 3;
        } else {
          margin = Math.ceil(margin);
        }
      }
    }

    const show_column_fix = show_column.map((column) =>
      typeof column == 'string' ? Database.raw(column) : column
    );
    if (per_page < 1) per_page = 1;
    if (page < 1) page = 1;
    return Promise.all([
      this.queryBuilder.clone().count('* AS count').first(),
      this.queryBuilder
        .select(...show_column_fix)
        .offset((page - 1) * per_page)
        .limit(per_page),
    ]).then(([total, rows]: any) => {
      const last_page = Math.ceil(total.count / per_page);

      const pagination: IPagination = {
        data: rows,
        meta: {
          total_data: total.count,
          current_page: page,
          per_page,
          last_page,
        },
      };

      if (useMargin) {
        const margin_rate = margin * 2 + 1;
        let down = page - margin;
        down = down < 1 ? 1 : down;
        let up = page + margin;
        up = up > last_page ? last_page : up;

        let list_margin: number[] = [
          ...Array(last_page + margin).keys(),
        ].reduce((simpan: number[], i) => {
          i = i + 1; // normalize
          if (last_page < margin_rate) {
            return [...simpan, i];
          }
          if (i >= down && i <= up) {
            return [...simpan, i];
          } else {
            if (i >= down && simpan.length < margin_rate) {
              return [...simpan, i];
            }
          }
          return [...simpan];
        }, []);
        const up_over = list_margin[list_margin.length - 1] - last_page;
        if (up_over > 0) {
          list_margin = [...Array(margin_rate).keys()].reduce(
            (simpan: number[], i) => {
              return [...simpan, i + last_page - margin_rate + 1];
            },
            []
          );
        }
        pagination.meta.margin = list_margin.filter((v) => v > 0);
      }

      return pagination;
    });
  };

  // ============================================================================================
  // ============================================================================================
}

export { DatabaseConnect, Database, KnexExtra };
