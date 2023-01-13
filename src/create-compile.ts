import { sqlFormat } from './select-compile';
import { TConfig } from './util-types';
import { tRefToSql } from './utils';

export const createCompile = (
  { tRef, tSchema }: TConfig,
  replace: boolean,
): string => {
  const replaceSql = replace ? 'OR REPLACE' : '';
  const columnsSql = Object.entries(tSchema)
    .map(([fName, fConfig]) => `${fName} ${fConfig.ddl()} ${fConfig.isNullable ? '' : 'NOT NULL'}`)
    .join(',');
  const sql = `CREATE ${replaceSql} TABLE ${tRefToSql(tRef)} (${columnsSql});`;
  return sqlFormat(sql);
};
