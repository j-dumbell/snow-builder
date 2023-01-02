import { orderObjectByKeys } from './utils';
import { SFType } from './util-types';
import { Executable } from './builders/executable';
import { orderFieldNames } from './select-compile';

const sfTypeToSql = (value: SFType): string => {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return `'${value.toISOString()}'`;
};

export const recordToSql = (record: Record<string, SFType>): string => {
  const ordered = orderObjectByKeys(record, false)
    .map(([, value]) => sfTypeToSql(value))
    .join(',');
  return `(${ordered})`;
};

export const insertRecordsSql = (
  table: string,
  records: Record<string, SFType>[],
): string => {
  const columns = Object.keys(records[0] as object).sort();
  const columnSql = `(${columns.join(',')})`;
  const valuesSql = records.map(recordToSql).join(',');

  return `INSERT INTO ${table} ${columnSql} VALUES ${valuesSql}`;
};

export const insertSelectSql = (
  table: string,
  executable: Executable<unknown>,
): string => {
  const fieldNames = orderFieldNames(executable.queryConfig).join(',');
  return `INSERT INTO ${table} (${fieldNames}) ${executable.compile()}`;
};
