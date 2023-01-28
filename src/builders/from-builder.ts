import { JoinType, QueryConfig } from '../query-config';
import {
  DBConfig,
  IsValidAlias,
  PrefixKeys,
  Selectable,
  SelectableToObject,
  SFType,
  Table,
  TableFromConfig,
  ValidFirstCharAlias,
} from '../util-types';
import { SelectBuilder } from './select-builder';
import { Connection } from 'snowflake-sdk';
import { selectFns, SelectFns } from '../sf-functions';
import { Executable, InferRType } from './executable';
import { tRefToSql } from '../utils';

export type RightTable<
  DB extends DBConfig,
  T extends (keyof DB & string) | Executable<Table>,
> = T extends keyof DB & string
  ? TableFromConfig<DB[T]['tSchema']>
  : InferRType<T>;


/** A query that includes a FROM clause */
export class FromBuilder<DB extends DBConfig, Fields extends Table> {

  /** Should not be instantiated directly.  Use db.selectFrom instead. */
  constructor(
    public sf: Connection,
    private dbConfig: DB,
    public queryConfig: QueryConfig,
  ) {}

  private join<
    TName extends (keyof DB & string) | Executable<Table>,
    TAlias extends ValidFirstCharAlias,
  >(
    joinType: JoinType,
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
    leftField: keyof Fields & string,
    rightField: keyof PrefixKeys<RightTable<DB, TName>, TAlias> & string,
  ): FromBuilder<DB, Fields & PrefixKeys<RightTable<DB, TName>, TAlias>> {
    const from =
      typeof table === 'string' ? tRefToSql(this.dbConfig[table].tRef) : table;

    const joinConfig = {
      joinType,
      table: from,
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
    >(this.sf, this.dbConfig, newQueryConfig);
  }

  /** Adds an INNER JOIN clause to the query */
  innerJoin<
    TName extends (keyof DB & string) | Executable<Table>,
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

  /** Adds a LEFT JOIN clause to the query */
  leftJoin<
    TName extends (keyof DB & string) | Executable<Table>,
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

  /** Adds a RIGHT JOIN clause to the query */
  rightJoin<
    TName extends (keyof DB & string) | Executable<Table>,
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

  /** Adds a SELECT clause to the query */
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

export class Expr<RType extends SFType> {
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

export class Aliased<RType extends SFType, AName extends ValidFirstCharAlias> {
  _type?: RType;
  constructor(
    public sql: string,
    public alias: IsValidAlias<AName, AName, never>,
  ) {}
}

export class Ordered {
  constructor(public sql: string, public order: 'asc' | 'desc') {}
}
