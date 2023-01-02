import { Connection } from 'snowflake-sdk';
import { FromBuilder } from './builders/from-builder';
import { IsValidAlias, PrefixKeys, ValidFirstCharAlias } from './util-types';
import { recordToSql, SFType } from './insert-compile';
import { execute } from './sf-promise';

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
    });
  }

  async insertInto<TName extends keyof DB & string>(
    table: TName,
    records: DB[TName][],
  ): Promise<void> {
    if (records.length === 0) {
      return;
    }
    const columns = Object.keys(records[0] as object).sort();
    const columnSql = `(${columns.join(',')})`;
    const valuesSql = records
      .map(recordToSql)
      .join(',')

    const sql = `INSERT INTO ${table} ${columnSql} VALUES ${valuesSql}`;
    console.log(sql);
    await execute(this.sf, sql);
  }
}
