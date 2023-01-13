import { tRefToSql } from './utils';
import { SFType, TInsert, TRef, TSchema, UpperCaseObjKey } from './util-types';
import { Executable } from './builders/executable';
import { orderFieldNames, sfTypeToSql } from './select-compile';

export const insertRecordsSql = <T extends TSchema>(
  tRef: TRef,
  tSchema: T,
  records: TInsert<T>[],
): string => {
  const refSql = tRefToSql(tRef);
  const columns = Object.keys(tSchema).sort();
  const columnSql = `(${columns.join(',')})`;

  const values = records.map(
    (r) =>
      `(${columns
        .map((c) => sfTypeToSql((r as Record<string, SFType>)[c]))
        .join(',')})`,
  );
  const valuesSql = values.join(',');

  return `INSERT INTO ${refSql} ${columnSql} VALUES ${valuesSql}`;
};

export const insertSelectSql = <T extends TSchema>(
  tRef: TRef,
  executable: Executable<UpperCaseObjKey<TInsert<T>>>,
): string => {
  const refSql = tRefToSql(tRef);
  const fieldNames = orderFieldNames(executable.queryConfig).join(',');
  return `INSERT INTO ${refSql} (${fieldNames}) ${executable.compile()}`;
};
