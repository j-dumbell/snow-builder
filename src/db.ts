import { Connection } from 'snowflake-sdk';
import { FromBuilder } from './builders/from-builder';
import { IsValidAlias, PrefixKeys, ValidFirstCharAlias } from './util-types';

export class Db<DB> {
  constructor(public sf: Connection) {}
  selectFrom<
    TName extends keyof DB & string,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
  ): FromBuilder<DB, PrefixKeys<DB[TName], TAlias>> {
    return new FromBuilder<DB, PrefixKeys<DB[TName], TAlias>>(this.sf, {
      from: table,
      fromAlias: alias,
      groupBy: [],
      joins: [],
      select: [],
    });
  }
}
