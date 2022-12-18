import { OnlyString, PrefixKeys, Selectable } from './util-types';

type JoinType = 'inner' | 'left' | 'right';

type JoinConfig = {
  joinType: JoinType;
  table: string;
  alias: string;
  leftField: string;
  rightField: string;
};

type QueryConfig = {
  select: string[];
  from: string;
  fromAlias: string;
  joins: JoinConfig[];
  where?: string;
  groupBy: string[];
  having?: string;
};

const compile = (queryConfig: QueryConfig): string => {
  const { select, from, where, joins, groupBy, having } = queryConfig;

  const selectSql = select.join(',');
  const whereSql = where ? `WHERE ${where}` : '';
  const groupBySql = groupBy ? `GROUP BY ${groupBy}` : '';
  const havingSql = having ? `HAVING ${having}` : '';

  return `
        SELECT ${selectSql}
        FROM ${from}
        ${whereSql}
        ${groupBySql}
        ${havingSql}  
    `;
};

class Db<DB> {
  selectFrom<T extends keyof DB & string, S extends string>(
    table: T,
    alias: S,
  ): FromBuilder<DB, PrefixKeys<DB[T], S>> {
    return new FromBuilder<DB, PrefixKeys<DB[T], S>>({
      from: table,
      fromAlias: alias,
      groupBy: [],
      joins: [],
      select: [],
    });
  }
}

export class FromBuilder<DB, T> {
  constructor(public queryConfig: QueryConfig) {}

  private join<
    L extends keyof DB & string,
    R extends keyof DB & string,
    S extends string,
  >(
    joinType: JoinType,
    table: R,
    alias: S,
    leftField: keyof T & string,
    rightField: keyof PrefixKeys<DB[R], S> & string,
  ): FromBuilder<DB, T & PrefixKeys<DB[R], S>> {
    this.queryConfig.joins.push({
      joinType,
      table,
      alias,
      leftField,
      rightField,
    });
    return new FromBuilder<DB, T & PrefixKeys<DB[R], S>>(this.queryConfig);
  }

  innerJoin<
    L extends keyof DB & string,
    R extends keyof DB & string,
    S extends string,
  >(
    table: R,
    alias: S,
    leftField: keyof T & string,
    rightField: keyof PrefixKeys<DB[R], S> & string,
  ): FromBuilder<DB, T & PrefixKeys<DB[R], S>> {
    return this.join<L, R, S>('inner', table, alias, leftField, rightField);
  }

  leftJoin<
    L extends keyof DB & string,
    R extends keyof DB & string,
    S extends string,
  >(
    table: R,
    alias: S,
    leftField: keyof T & string,
    rightField: keyof PrefixKeys<DB[R], S> & string,
  ): FromBuilder<DB, T & PrefixKeys<DB[R], S>> {
    return this.join<L, R, S>('left', table, alias, leftField, rightField);
  }

  rightJoin<
    L extends keyof DB & string,
    R extends keyof DB & string,
    S extends string,
  >(
    table: R,
    alias: S,
    leftField: keyof T & string,
    rightField: keyof PrefixKeys<DB[R], S> & string,
  ): FromBuilder<DB, T & PrefixKeys<DB[R], S>> {
    return this.join<L, R, S>('right', table, alias, leftField, rightField);
  }

  select(...fields: Selectable<T>[]): SelectBuilder<T> {
    return new SelectBuilder({
      ...this.queryConfig,
      select: fields as string[],
    });
  }
}

class SelectBuilder<T> {
  constructor(public queryConfig: QueryConfig) {}

  where(raw: string): WhereBuilder<T> {
    return new WhereBuilder({ ...this.queryConfig, where: raw });
  }

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}

class WhereBuilder<T> {
  constructor(public queryConfig: QueryConfig) {}

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}

class GroupByBuilder {
  constructor(public queryConfig: QueryConfig) {}

  having(raw: string): HavingBuilder {
    return new HavingBuilder({ ...this.queryConfig, having: raw });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}

class HavingBuilder {
  constructor(public queryConfig: QueryConfig) {}

  compile(): string {
    return compile(this.queryConfig);
  }
}

type Users = {
  userId: number;
  email: string;
  isVerified: boolean;
};

type Orders = {
  orderId: number;
  userId: number;
  orderDate: Date;
};

type AllTables = {
  users: Users;
  orders: Orders;
};

const db = new Db<AllTables>();

const query = db
  .selectFrom('users', 'u')
  .rightJoin('orders', 'o', 'u.userId', 'o.orderId')
  .select('u.email', 'u.email', 'o.orderDate', 'o.userId')
  .where('blah')
  .groupBy('u.email')
  .having('bas')
  .compile();
