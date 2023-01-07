import { match } from 'ts-pattern';
import { sqlFormat } from './select-compile';
import { SType, TConfig } from './util-types';
import { tRefToSql } from './utils';

const sTypeToDDL = (sType: SType & { nullable: boolean }): string => {
  const collTypeSql = match(sType)
    .with({ _type: 'varchar' }, (x) => {
      const argsSql = x.length ? `(${x.length})` : '';
      return `${x._type}${argsSql}`;
    })
    .with({ _type: 'number' }, (x) => `${x._type}(${x.precision},${x.scale})`)
    .with(
      { _type: 'boolean' },
      { _type: 'date' },
      { _type: 'timestamp' },
      (x) => `${x._type}`,
    )
    .exhaustive();
  const nullSql = sType.nullable ? '' : ' NOT NULL';

  return `${collTypeSql} ${nullSql}`;
};

export const createCompile = (
  { tRef, tSchema }: TConfig,
  replace: boolean,
): string => {
  const replaceSql = replace ? 'OR REPLACE' : '';
  const columnsSql = Object.entries(tSchema)
    .map(([fName, fConfig]) => `${fName} ${sTypeToDDL(fConfig)}`)
    .join(',');
  const sql = `CREATE ${replaceSql} TABLE ${tRefToSql(tRef)} (${columnsSql});`;
  return sqlFormat(sql);
};
