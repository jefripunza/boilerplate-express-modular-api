import knex, { Knex } from 'knex';

import { Knex as KnexConfig } from '../config';
import {
  isArray,
  isObject,
  isNumber,
  isDateFormat
} from '../helpers/validation';

import { IDynamicObject, IDataTable } from '../contracts/data.contract';

const knexInstance = knex(KnexConfig.config);

const DatabaseConnect = async (
  // eslint-disable-next-line @typescript-eslint/ban-types
  cb: boolean | Function = false
): Promise<void> => {
  knexInstance
    .raw('SELECT 1')
    .then(() => {
      console.log('✈️ Database connected');
      if (cb && typeof cb === 'function') cb();
    })
    .catch((e) => {
      console.log('❌ Database not connected');
      console.error(e);
      process.exit(1);
    });
};

class CustomQueryBuilder<T> {
  private queryBuilder: Knex.QueryBuilder;

  constructor(queryBuilder: Knex.QueryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  // ============================================================================================
  // ============================================================================================

  select(...columns: string[]): CustomQueryBuilder<T> {
    this.queryBuilder.select(...columns);
    return this;
  }
  from(table: string): CustomQueryBuilder<T> {
    this.queryBuilder.from(table);
    return this;
  }
  first(): CustomQueryBuilder<T> {
    this.queryBuilder.first();
    return this;
  }

  where(column: string, value: any): CustomQueryBuilder<T> {
    this.queryBuilder.where(column, value);
    return this;
  }
  orWhere(column: string, value: any): CustomQueryBuilder<T> {
    this.queryBuilder.orWhere(column, value);
    return this;
  }
  whereRaw(condition: string): CustomQueryBuilder<T> {
    this.queryBuilder.whereRaw(condition);
    return this;
  }
  whereCallback(
    condition: (queryBuilder: CustomQueryBuilder<T>) => void
  ): CustomQueryBuilder<T> {
    condition(this.queryBuilder as unknown as CustomQueryBuilder<T>);
    return this;
  }

  insert(columns: object): CustomQueryBuilder<T> {
    this.queryBuilder.insert(columns);
    return this;
  }
  update(columns: object): CustomQueryBuilder<T> {
    this.queryBuilder.update(columns);
    return this;
  }
  delete(): CustomQueryBuilder<T> {
    this.queryBuilder.delete();
    return this;
  }

  // Join
  innerJoin(
    table_a: string,
    column_a: string,
    column_b: string
  ): CustomQueryBuilder<T> {
    this.queryBuilder.innerJoin(table_a, column_a, column_b);
    return this;
  }
  leftJoin(
    table_a: string,
    column_a: string,
    column_b: string
  ): CustomQueryBuilder<T> {
    this.queryBuilder.innerJoin(table_a, column_a, column_b);
    return this;
  }

  // Wajib...
  async execute(): Promise<any> {
    return await this.queryBuilder;
  }

  // ============================================================================================
  // ============================================================================================

  orderBy = (sort_by = 'id', order_by = 'ASC') => {
    sort_by = sort_by ? sort_by : 'id';
    order_by = order_by ? order_by : 'ASC';
    order_by = String(order_by).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    this.queryBuilder.orderBy(sort_by, order_by);
    return this;
  };

  search = (column: string | string[], value: string) => {
    if (value && value.length > 0) {
      if (typeof column === 'string') {
        return this.queryBuilder.where(
          knexInstance.raw(`LOWER(${column})`),
          'LIKE',
          `%${String(value).toLowerCase()}%`
        );
      } else if (isArray(column)) {
        column.forEach((col) => {
          if (typeof col !== 'string') return;
          return this.queryBuilder.orWhere(
            knexInstance.raw(`LOWER(${col})`),
            'LIKE',
            `%${String(value).toLowerCase()}%`
          );
        });
      }
    }
    return this; // skip
  };

  filter = (filter_query: string, column_set: any) => {
    if (!filter_query || typeof filter_query !== 'string') return this;
    const filters = filter_query.split(';');
    if (filters.length > 0) {
      if (!isObject(column_set)) {
        throw new Error('bad, column_set on filter not object');
      }
      const column_key = Object.keys(column_set).filter(
        (key) =>
          ['search', 'boolean', 'boolean_date', 'date_range'].includes(key) &&
          isArray(column_set[key])
      );
      if (column_key.length === 0) {
        throw new Error('bad, column_set is zero object or key not array');
      }
      const focus: any = {};
      focus.search = column_set?.search ?? [];
      focus.boolean = column_set?.boolean ?? [];
      focus.boolean_date = column_set?.boolean_date ?? [];
      focus.date_range = column_set?.date_range ?? [];

      filters.forEach((filter) => {
        let [column, value]: any = filter.split(':');
        if (focus.search.length > 0 && focus.search.includes(column)) {
          // ex: my love...
          this.search(column, value);
        }
        if (focus.boolean.length > 0 && focus.boolean.includes(column)) {
          // ex: true / false
          if (String(value).toLowerCase() === 'true') {
            value = true;
          } else if (String(value).toLowerCase() === 'false') {
            value = false;
          }
          if (typeof value === 'boolean')
            this.queryBuilder.where(column, value);
        }
        if (
          focus.boolean_date.length > 0 &&
          focus.boolean_date.includes(column)
        ) {
          // ex: true / false
          if (String(value).toLowerCase() === 'true') {
            this.queryBuilder.whereNot(column, null);
          } else if (String(value).toLowerCase() === 'false') {
            this.queryBuilder.where(column, null);
          }
        }
        if (focus.date_range.length > 0 && focus.date_range.includes(column)) {
          // ex: 2023-01-01>2023-12-31
          if (!String(value).includes('>')) return;
          const [start, end] = String(value).split('>');
          if (isDateFormat(start) && isDateFormat(end)) {
            this.queryBuilder.whereBetween(column, [
              new Date(start),
              new Date(end)
            ]);
          }
        }
      });
    }
    return this; // skip or next...
  };

  paginate = (
    per_page = 10,
    page = 1,
    show_column = ['*'], // ['users.id', 'name', 'username']
    margin = 0
  ): Promise<{
    data: any[];
    meta: {
      total_data: number;
      current_page: number;
      per_page: number;
      last_page: number;
      margin?: number[];
    };
  }> => {
    // fine value
    if (!per_page || !isNumber(per_page) || per_page <= 0) {
      per_page = 10; // default
    }
    if (!page || !isNumber(page) || page <= 0) {
      page = 1; // default
    }
    const useMargin = margin && margin !== 0;
    if (useMargin) {
      if (typeof margin !== 'number') {
        margin = 3;
      } else {
        if (margin < 1) {
          margin = 3;
        } else {
          margin = Math.ceil(margin);
        }
      }
    }
    if (!show_column || !isArray(show_column)) show_column = ['*'];
    if (per_page < 1) per_page = 1;
    if (page < 1) page = 1;

    let offset = (page - 1) * per_page;
    return Promise.all([
      this.queryBuilder.clone().count('* as count').first(),
      this.queryBuilder
        .select(...show_column)
        .offset(offset)
        .limit(per_page)
    ]).then(([total, rows]) => {
      const last_page = Math.ceil(total.count / per_page);

      /**
       * @type {{ data: any[], meta: { total_data: number, current_page: number, per_page: number, last_page: number, margin?: number[] } }}
       */
      let pagination: any = {};
      pagination.data = rows;
      pagination.meta = {
        total_data: total.count,
        current_page: page,
        per_page,
        last_page
      };
      if (useMargin) {
        const margin_rate = margin * 2 + 1;
        let down = page - margin;
        down = down < 1 ? 1 : down;
        let up = page + margin;
        up = up > last_page ? last_page : up;
        /**
         * @type {number[]}
         */
        let list_margin: number[] = [...Array(last_page + margin)].reduce(
          (simpan, i) => {
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
          },
          []
        );
        const up_over = list_margin[list_margin.length - 1] - last_page;
        if (up_over > 0) {
          list_margin = [...Array(margin_rate)].reduce((simpan, i) => {
            return [...simpan, i + last_page - margin_rate + 1];
          }, []);
        }
        pagination.meta.margin = list_margin;
      }

      return pagination;
    });
  };
}

const queryBuilder = knexInstance.select();
const Database = new CustomQueryBuilder(queryBuilder);

export { DatabaseConnect, Database };
