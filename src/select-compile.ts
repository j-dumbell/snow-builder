import { JoinConfig, QueryConfig } from './query-config';
import { format } from 'sql-formatter';
import { match, P } from 'ts-pattern';
import { SFType, ValidFirstCharAlias } from './util-types';
import { Aliased, Expr } from './builders/from-builder';

export const sfTypeToSql = (sfType: SFType): string =>
  match(sfType)
    .with(P.string, (x) => `'${x}'`)
    .with(P.number, (x) => String(x))
    .with(P.boolean, (x) => String(x))
    .with(P.nullish, () => 'null')
    .with(P.instanceOf(Date), (x) => `'${x.toISOString()}'`)
    .exhaustive();

const toSql = (
  s:
    | SFType
    | string[]
    | number[]
    | boolean[]
    | Date[]
    | Expr<SFType>
    | Aliased<SFType, ValidFirstCharAlias>,
): string =>
  match(s)
    .with(P.string, P.number, P.boolean, P.instanceOf(Date), P.nullish, (x) =>
      sfTypeToSql(x),
    )
    .with(P.array(P._), (x) => `(${x.map(sfTypeToSql).join(',')})`)
    .with(P.instanceOf(Expr), (x) => x.sql)
    .with(P.instanceOf(Aliased), (x) => `${x.sql} ${x.alias}`)
    .exhaustive();

export const sqlFormat = (s: string): string =>
  format(s, { keywordCase: 'upper' });

const stripRef = (field: string): string =>
  field.includes('.') ? field.split('.')[1] : field;

export const orderFieldNames = (queryConfig: QueryConfig): string[] =>
  queryConfig.select
    .map((field) =>
      typeof field === 'string' ? stripRef(field) : field.alias,
    )
    .sort();

const resolveFieldName = (fieldOrAlias: Aliased<SFType, ValidFirstCharAlias> | string): string => 
  typeof fieldOrAlias === 'string' ? stripRef(fieldOrAlias) : fieldOrAlias.alias; 

const joinConfigToSql = (jc: JoinConfig): string => {
  const tableSql =
    typeof jc.table === 'string' ? jc.table : `(${jc.table.compile()})`;
  return `${jc.joinType} JOIN ${tableSql} ${jc.alias} ON ${jc.leftField} = ${jc.rightField}`;
};

export const selectCompile = (queryConfig: QueryConfig): string => {
  const {
    select,
    from,
    fromAlias,
    where,
    joins,
    groupBy,
    having,
    orderBy,
    limit,
  } = queryConfig;

  const selectSql = select
    .sort((a, b) => resolveFieldName(a) < resolveFieldName(b) ? -1 : 1)
    .map((col) => (typeof col === 'string' ? col : `${col.sql} ${col.alias}`))
    .join(', ');

  const fromSql = typeof from === 'string' ? from : `(${from.compile()})`;
  const joinSql = joins ? joins.map(joinConfigToSql).join('\n') : '';

  const whereSql: string = match(where)
    .with(P.nullish, () => '')
    .with(P.string, (x) => `WHERE ${x}`)
    .with(
      { expr1: P.string },
      (x) => `WHERE ${x.expr1} ${x.op} ${toSql(x.expr2)}`,
    )
    .with(
      { expr1: P.instanceOf(Expr) },
      (x) => `WHERE ${toSql(x.expr1)} ${x.op} ${toSql(x.expr2)}`,
    )
    .exhaustive();

  const groupBySql = groupBy?.length ? `GROUP BY ${groupBy.join(',')}` : '';
  const havingSql = having ? `HAVING ${having}` : '';
  const orderBySql = orderBy?.length
    ? `ORDER BY ${orderBy.map((o) => `${o.sql} ${o.order}`).join(',')}`
    : '';
  const limitSql = limit ? `LIMIT ${limit}` : '';

  const sql = `
    SELECT ${selectSql}
    FROM ${fromSql} ${fromAlias}
    ${joinSql}
    ${whereSql}
    ${groupBySql}
    ${havingSql}
    ${orderBySql}
    ${limitSql}  
  `;

  return sqlFormat(sql);
};
