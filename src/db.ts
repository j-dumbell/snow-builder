import { Connection } from 'snowflake-sdk';
import { FromBuilder } from './builders/from-builder';
import {
  IsValidAlias,
  PrefixKeys,
  UpperCaseObjKey,
  ValidFirstCharAlias,
} from './util-types';
import { insertRecordsSql, insertSelectSql } from './insert-compile';
import { execute } from './sf-promise';
import { Executable } from './builders/executable';
import { SFType } from './util-types';

type Table = Record<string, SFType>;

export class Db<DB extends Record<string, Table>> {
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
      orderBy: [],
    });
  }

  async insertInto<TName extends keyof DB & string>(
    table: TName,
    recordsOrSelect: DB[TName][] | Executable<UpperCaseObjKey<DB[TName]>>,
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
