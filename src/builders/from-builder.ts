import { JoinType, QueryConfig } from '../query-config';
import {
  OnlyNumber,
  OnlyString,
  PrefixKeys,
  Selectable,
  SelectableToObject,
} from '../util-types';
import { SelectBuilder } from './select-builder';
import { Connection } from 'snowflake-sdk';

export class FromBuilder<DB, Fields> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  private join<TName extends keyof DB & string, TAlias extends string>(
    joinType: JoinType,
    table: TName,
    alias: TAlias,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<DB[TName], TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<DB[TName], TAlias>> {
    const joinConfig = {
      joinType,
      table,
      alias,
      leftField,
      rightField,
    };
    const newQueryConfig = {
      ...this.queryConfig,
      joins: this.queryConfig.joins
        ? [...this.queryConfig.joins, joinConfig]
        : [joinConfig],
    };
    return new FromBuilder<DB, Fields & PrefixKeys<DB[TName], TAlias>>(
      this.sf,
      newQueryConfig,
    );
  }

  innerJoin<TName extends keyof DB & string, TAlias extends string>(
    table: TName,
    alias: TAlias,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<DB[TName], TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<DB[TName], TAlias>> {
    return this.join<TName, TAlias>(
      'inner',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  leftJoin<TName extends keyof DB & string, TAlias extends string>(
    table: TName,
    alias: TAlias,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<DB[TName], TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<DB[TName], TAlias>> {
    return this.join<TName, TAlias>(
      'left',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  rightJoin<TName extends keyof DB & string, TAlias extends string>(
    table: TName,
    alias: TAlias,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<DB[TName], TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<DB[TName], TAlias>> {
    return this.join<TName, TAlias>(
      'right',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  select<Selected extends Selectable<Fields>[]>(
    fields: Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>>;
  select<Selected extends Selectable<Fields>[]>(
    fn: (f: SnowFns<Fields>) => Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>>;
  select<Selected extends Selectable<Fields>[]>(
    arg: ((f: SnowFns<Fields>) => Selected) | Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>> {
    const select = Array.isArray(arg) ? arg : arg(snowFns<Fields>());
    return new SelectBuilder<Fields, SelectableToObject<Fields, Selected>>(
      this.sf,
      {
        ...this.queryConfig,
        select,
      },
    );
  }
}

export class Expr<T> {
  constructor(public sql: string) {}

  as<AName extends string>(alias: AName): Aliased<T, AName> {
    return new Aliased<T, AName>(this.sql, alias);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Aliased<T, AName extends string> {
  constructor(public sql: string, public alias: AName) {}
}

const sum = <T>(
  field: OnlyNumber<T>,
  partitionBy?: (keyof T & string)[],
): Expr<number> => {
  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';
  const sql = `SUM(${field})${partitionBySql}`;

  return new Expr<number>(sql);
};

const count = <T>(
  field?: (keyof T & string) | '*',
  partitionBy?: (keyof T & string)[],
): Expr<number> => {
  const fieldSql = field || '';

  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';
  const sql = `COUNT(${fieldSql})${partitionBySql}`;

  return new Expr<number>(sql);
};

const min = <T>(
  field: keyof T & string,
  partitionBy?: (keyof T & string)[],
  orderBy?: (keyof T & string)[],
): Expr<number> => {
  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';

  const orderBySql = orderBy ? ` ORDER BY ${orderBy.join(',')}` : '';

  const sql = `COUNT(${field})${partitionBySql}${orderBySql}`;

  return new Expr<number>(sql);
};

const toDate = <T>(field: OnlyString<T>): Expr<Date> =>
  new Expr<Date>(`to_date(${field})`);

export const s = (sql: string): Expr<unknown> => new Expr(sql);

const snowFns = <T>() => ({
  sum: sum as typeof sum<T>,
  count: count as typeof count<T>,
  min: min as typeof min<T>,
  toDate: toDate as typeof toDate<T>,
});

type SnowFns<T> = ReturnType<typeof snowFns<T>>;
