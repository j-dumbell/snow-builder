import { JoinType, QueryConfig } from '../query-config';
import { PrefixKeys, Selectable } from '../util-types';
import { SelectBuilder } from './select-builder';

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
    return new FromBuilder<DB, T & PrefixKeys<DB[R], S>>(newQueryConfig);
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
