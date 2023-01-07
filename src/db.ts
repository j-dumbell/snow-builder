import { Connection } from 'snowflake-sdk';
import { FromBuilder, RightTable } from './builders/from-builder';
import {
  DBConfig,
  IsValidAlias,
  PrefixKeys,
  Table,
  TableFromConfig,
  UpperCaseObjKey,
  ValidFirstCharAlias,
} from './util-types';
import { insertRecordsSql, insertSelectSql } from './insert-compile';
import { execute } from './sf-promise';
import { Executable } from './builders/executable';

export class Db<DB extends DBConfig> {
  constructor(public sf: Connection) {}
  selectFrom<
    TName extends (keyof DB & string) | Executable<Table>,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
  ): FromBuilder<DB, PrefixKeys<RightTable<DB, TName>, TAlias>> {
    return new FromBuilder<DB, PrefixKeys<RightTable<DB, TName>, TAlias>>(
      this.sf,
      {
        from: table,
        fromAlias: alias,
        groupBy: [],
        joins: [],
        select: [],
        orderBy: [],
      },
    );
  }

  async insertInto<TName extends keyof DB & string>(
    table: TName,
    recordsOrSelect:
      | TableFromConfig<DB[TName]>[]
      | Executable<UpperCaseObjKey<TableFromConfig<DB[TName]>>>,
  ): Promise<void> {
    if (Array.isArray(recordsOrSelect) && recordsOrSelect.length === 0) {
      return;
    }

    const sql = Array.isArray(recordsOrSelect)
      ? insertRecordsSql(table, recordsOrSelect)
      : insertSelectSql(table, recordsOrSelect);

    await execute(this.sf, sql);
  }
}
