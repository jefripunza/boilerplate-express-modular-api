const { isArray, isObject, isNumber } = require("../helpers/validation");
const date_regex = /^\d{4}-\d{2}-\d{2}$/;

const knexfile = require("../../knexfile");
/**
 * @type {import("knex").Knex}
 */
const Database = require("knex")(knexfile);

const DatabaseConnect = async (cb = false) => {
  Database.raw("SELECT 1")
    .then(() => {
      console.log("✈️  Database connected");
      if (cb) cb();
    })
    .catch((e) => {
      console.log("❌ Database not connected");
      console.error(e);
      process.exit(1);
    });
};

var KnexQueryBuilder = require("knex/lib/query/querybuilder");
// ========================================================================================
// ========================================================================================
// -> Custom Chain Function

KnexQueryBuilder.prototype.newOrderBy = function (
  sort_by = "id",
  order_by = "ASC"
) {
  if (typeof sort_by != "string") sort_by = false;
  sort_by = sort_by ? sort_by : "id";
  if (typeof order_by != "string") order_by = false;
  order_by = order_by ? order_by : "ASC";
  order_by = String(order_by).toLowerCase() == "desc" ? "DESC" : "ASC";
  return this.orderBy(sort_by, order_by);
};

// ========================================================================================
// -> New Chain Function

KnexQueryBuilder.prototype.search = function (column, value) {
  if (value && value.length > 0) {
    if (typeof column == "string") {
      return this.where(
        Database.raw(`LOWER(${column})`),
        "LIKE",
        `%${String(value).toLowerCase()}%`
      );
    } else if (isArray(column)) {
      column.forEach((col) => {
        if (typeof v != "string") return;
        return this.orWhere(
          Database.raw(`LOWER(${col})`),
          "LIKE",
          `%${String(value).toLowerCase()}%`
        );
      });
    }
  }
  return this; // skip
};

KnexQueryBuilder.prototype.filter = function (filter_query, column_set) {
  if (!filter_query || typeof filter_query != "string") return this;
  const filters = filter_query.split(";");
  if (filters.length > 0) {
    if (!isObject(column_set)) {
      throw new Error("bad, column_set on filter not object");
    }
    const column_key = Object.keys(column_set).filter(
      (key) =>
        ["search", "boolean", "boolean_date", "date_range"].includes(key) &&
        isArray(column_set[key])
    );
    if (column_key.length == 0) {
      throw new Error("bad, column_set is zero object or key not array");
    }

    const focus = {};
    focus.search = column_set?.search ?? [];
    focus.boolean = column_set?.boolean ?? [];
    focus.boolean_date = column_set?.boolean_date ?? [];
    focus.date_range = column_set?.date_range ?? [];

    filters.forEach((filter) => {
      let [column, value] = filter.split(":");
      if (focus.search.length > 0 && focus.search.includes(column)) {
        // ex: my love...
        this.search(column, value);
      }
      if (focus.boolean.length > 0 && focus.boolean.includes(column)) {
        // ex: true / false
        if (String(value).toLowerCase() == "true") {
          value = true;
        } else if (String(value).toLowerCase() == "false") {
          value = false;
        }
        if (typeof value == "boolean") this.where(column, value);
      }
      if (
        focus.boolean_date.length > 0 &&
        focus.boolean_date.includes(column)
      ) {
        // ex: true / false
        if (String(value).toLowerCase() == "true") {
          this.whereNot(column, null);
        } else if (String(value).toLowerCase() == "false") {
          this.where(column, null);
        }
      }
      if (focus.date_range.length > 0 && focus.date_range.includes(column)) {
        // ex: 2023-01-01>2023-12-31
        if (!String(value).includes(">")) return;
        const [start, end] = String(value).split(">");
        if (date_regex.test(start) && date_regex.test(end)) {
          this.whereBetween(column, [new Date(start), new Date(end)]);
        }
      }
    });
  }
  return this; // skip or next...
};

KnexQueryBuilder.prototype.paginate = function (
  per_page = 10,
  page = 1,
  show_column = ["*"], // ['users.id', 'name', 'username']
  margin = 0
) {
  // fine value
  if (!per_page || !isNumber(per_page) || per_page <= 0) {
    per_page = 10; // default
  } else {
    per_page = parseInt(per_page);
  }
  if (!page || !isNumber(page) || page <= 0) {
    page = 1; // default
  } else {
    page = parseInt(page);
  }
  const useMargin = margin && margin != 0;
  if (useMargin) {
    if (typeof margin != "number") {
      margin = 3;
    } else {
      if (margin < 1) {
        margin = 3;
      } else {
        margin = Math.ceil(margin);
      }
    }
  }

  if (!show_column || !isArray(show_column)) show_column = ["*"];
  if (per_page < 1) per_page = 1;
  if (page < 1) page = 1;

  let offset = (page - 1) * per_page;
  return Promise.all([
    this.clone().count("* as count").first(),
    this.select(...show_column)
      .offset(offset)
      .limit(per_page),
  ]).then(([total, rows]) => {
    const last_page = Math.ceil(total.count / per_page);

    /**
     * @type {{ data: any[], meta: { total_data: number, current_page: number, per_page: number, last_page: number, margin?: number[] } }}
     */
    let pagination = {};
    pagination.data = rows;
    pagination.meta = {
      total_data: total.count,
      current_page: page,
      per_page,
      last_page,
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
      let list_margin = [...Array(last_page + margin).keys()].reduce(
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
        list_margin = [...Array(margin_rate).keys()].reduce((simpan, i) => {
          return [...simpan, i + last_page - margin_rate + 1];
        }, []);
      }
      pagination.meta.margin = list_margin;
    }

    return pagination;
  });
};

// ========================================================================================
// ========================================================================================
Database.queryBuilder = function () {
  return new KnexQueryBuilder(Database.client);
};

module.exports = { DatabaseConnect, Database };
