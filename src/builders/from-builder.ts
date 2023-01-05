import { JoinType, QueryConfig } from '../query-config';
import {
  IsValidAlias,
  PrefixKeys,
  Selectable,
  SelectableToObject,
  Table,
  ValidFirstCharAlias,
} from '../util-types';
import { SelectBuilder } from './select-builder';
import { Connection } from 'snowflake-sdk';
import { selectFns, SelectFns } from '../sf-functions';
import { Executable, InferRType } from './executable';

type RightTable<
  DB,
  T extends (keyof DB & string) | Executable<unknown>,
> = T extends keyof DB & string ? DB[T] : InferRType<T>;

export class FromBuilder<DB, Fields extends Table> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  private join<
    TName extends (keyof DB & string) | Executable<unknown>,
    TAlias extends ValidFirstCharAlias,
  >(
    joinType: JoinType,
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<RightTable<DB, TName>, TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<RightTable<DB, TName>, TAlias>> {
    const joinConfig = {
      joinType,
      table,
      alias,
      leftField,
      rightField,
    };
    const newQueryConfig: QueryConfig = {
      ...this.queryConfig,
      joins: this.queryConfig.joins
        ? [...this.queryConfig.joins, joinConfig]
        : [joinConfig],
    };
    return new FromBuilder<
      DB,
      Fields & PrefixKeys<RightTable<DB, TName>, TAlias>
    >(this.sf, newQueryConfig);
  }

  innerJoin<
    TName extends (keyof DB & string) | Executable<unknown>,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<RightTable<DB, TName>, TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<RightTable<DB, TName>, TAlias>> {
    return this.join<TName, TAlias>(
      'inner',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  leftJoin<
    TName extends (keyof DB & string) | Executable<unknown>,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<RightTable<DB, TName>, TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<RightTable<DB, TName>, TAlias>> {
    return this.join<TName, TAlias>(
      'left',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  rightJoin<
    TName extends (keyof DB & string) | Executable<unknown>,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<RightTable<DB, TName>, TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<RightTable<DB, TName>, TAlias>> {
    return this.join<TName, TAlias>(
      'right',
      table,
      alias,
      leftField,
      rightField,
    );
  }

  select<Selected extends Selectable<Fields>[]>(
    selected: ((f: SelectFns<Fields>) => Selected) | Selected,
  ): SelectBuilder<Fields, SelectableToObject<Fields, Selected>> {
    const select = Array.isArray(selected)
      ? selected
      : selected(selectFns<Fields>());
    return new SelectBuilder<Fields, SelectableToObject<Fields, Selected>>(
      this.sf,
      {
        ...this.queryConfig,
        select,
      },
    );
  }
}

export class Expr<RType> {
  _type?: RType;
  constructor(public sql: string) {}

  as<AName extends ValidFirstCharAlias>(
    alias: IsValidAlias<AName, AName, never>,
  ): Aliased<RType, AName> {
    return new Aliased<RType, AName>(this.sql, alias);
  }

  asc(): Ordered {
    return new Ordered(this.sql, 'asc');
  }

  desc(): Ordered {
    return new Ordered(this.sql, 'desc');
  }
}

export class Aliased<RType, AName extends ValidFirstCharAlias> {
  _type?: RType;
  constructor(
    public sql: string,
    public alias: IsValidAlias<AName, AName, never>,
  ) {}
}

export class Ordered {
  constructor(public sql: string, public order: 'asc' | 'desc') {}
}
