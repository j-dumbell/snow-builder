import { Connection } from 'snowflake-sdk';
import { FromBuilder, RightTable } from './builders/from-builder';
import {
  DBConfig,
  IsValidAlias,
  PrefixKeys,
  Table,
  TInsert,
  UpperCaseObjKey,
  ValidFirstCharAlias,
} from './util-types';
import { insertRecordsSql, insertSelectSql } from './insert-compile';
import { execute } from './sf-promise';
import { Executable } from './builders/executable';
import { createCompile } from './create-compile';
import { tRefToSql } from './utils';
import { sqlFormat } from './select-compile';

type Insertable<DB extends DBConfig, TName extends keyof DB> =
  | TInsert<DB[TName]['tSchema']>[]
  | Executable<UpperCaseObjKey<TInsert<DB[TName]['tSchema']>>>;

export class Db<DB extends DBConfig> {
  constructor(public sf: Connection, private dbConfig: DB) {}

  selectFrom<
    TName extends (keyof DB & string) | Executable<Table>,
    TAlias extends ValidFirstCharAlias,
  >(
    table: TName,
    alias: IsValidAlias<TAlias, TAlias, never>,
  ): FromBuilder<DB, PrefixKeys<RightTable<DB, TName>, TAlias>> {
    const from =
      typeof table === 'string' ? tRefToSql(this.dbConfig[table].tRef) : table;

    return new FromBuilder<DB, PrefixKeys<RightTable<DB, TName>, TAlias>>(
      this.sf,
      this.dbConfig,
      {
        from,
        fromAlias: alias,
        groupBy: [],
        joins: [],
        select: [],
        orderBy: [],
      },
    );
  }

  /** INSERT INTO the provided table.  Can insert an array of records,
   * or the result of a SELECT query via db.selectFrom.
  */
  async insertInto<TName extends keyof DB & string>(
    table: TName,
    recordsOrSelect: Insertable<DB, TName>,
  ): Promise<void> {
    if (Array.isArray(recordsOrSelect) && recordsOrSelect.length === 0) {
      return;
    }

    const sql = Array.isArray(recordsOrSelect)
      ? insertRecordsSql(
          this.dbConfig[table].tRef,
          this.dbConfig[table].tSchema,
          recordsOrSelect,
        )
      : insertSelectSql(this.dbConfig[table].tRef, recordsOrSelect);

    await execute(this.sf, sqlFormat(sql));
  }

  /** Create or optionally replace the provided table */
  async createTable(tableName: keyof DB, replace: boolean): Promise<void> {
    const sql = createCompile(this.dbConfig[tableName], replace);
    await execute(this.sf, sql);
  }

  /** Create or optionally replace all tables in the DB configuration */
  async createAllTables(replace: boolean): Promise<void> {
    const tNames = Object.keys(this.dbConfig);
    await Promise.all(tNames.map((tName) => this.createTable(tName, replace)));
  }

  /** Drop the provided table if it exists */
  async dropTable(tableName: keyof DB): Promise<void> {
    const tRefSql = tRefToSql(this.dbConfig[tableName].tRef);
    const sql = `DROP TABLE IF EXISTS ${tRefSql};`;
    await execute(this.sf, sql);
  }

  /** Drop all tables in the DB configuration if they exist */
  async dropAllTables(): Promise<void> {
    const tNames = Object.keys(this.dbConfig);
    await Promise.all(tNames.map((tName) => this.dropTable(tName)));
  }
}
