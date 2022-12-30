import { JoinType, QueryConfig } from '../query-config';
import { PrefixKeys, Selectable, SelectableToObject } from '../util-types';
import { SelectBuilder } from './select-builder';
import { Connection } from 'snowflake-sdk';
import { selectFns, SelectFns } from '../sf-functions';

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
    fn: (f: SelectFns<Fields>) => Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>>;
  select<Selected extends Selectable<Fields>[]>(
    arg: ((f: SelectFns<Fields>) => Selected) | Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>> {
    const select = Array.isArray(arg) ? arg : arg(selectFns<Fields>());
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
  _type?: T;
  constructor(public sql: string) {}

  as<AName extends string>(alias: AName): Aliased<T, AName> {
    return new Aliased<T, AName>(this.sql, alias);
  }
}

export class Aliased<T, AName extends string> {
  _type?: T;
  constructor(public sql: string, public alias: AName) {}
}
