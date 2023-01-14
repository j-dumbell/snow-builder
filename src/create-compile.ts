import { match } from 'ts-pattern';
import { sqlFormat } from './select-compile';
import { FConfig } from './sf-types';
import { TConfig } from './util-types';
import { tRefToSql } from './utils';

const sTypeToDDL = (fConfig: FConfig): string => {
  const collTypeSql = match(fConfig)
    .with({ _tag: 'varchar' }, (x) => {
      const argsSql = x.length ? `(${x.length})` : '';
      return `VARCHAR${argsSql}`;
    })
    .with({ _tag: 'number' }, (x) => `NUMBER(${x.precision},${x.scale})`)
    .with({ _tag: 'timestamp' }, (x) => `TIMESTAMP${x.tz ? `_${x.tz}` : ''}`)
    .with(
      { _tag: 'time' },
      (x) => `TIME${x.precision ? `(${x.precision})` : ''}`,
    )
    .with({ _tag: 'boolean' }, { _tag: 'date' }, (x) => `${x._tag}`)
    .exhaustive();
  const nullSql = fConfig.nullable ? '' : ' NOT NULL';

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
