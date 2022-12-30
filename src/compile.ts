import { QueryConfig } from './query-config';
import { format } from 'sql-formatter';
import { Expr } from './builders/from-builder';

const toSql = (s: string | Expr<unknown>): string =>
  typeof s === 'string' ? s : s.sql;

export const compile = (queryConfig: QueryConfig): string => {
  const { select, from, fromAlias, where, joins, groupBy, having } =
    queryConfig;

  const selectSql = select
    .map((col) =>
      typeof col === 'string' ? col : `${col.sql} as ${col.alias}`,
    )
    .join(', ');

  const joinSql = joins
    ? joins
        .map(
          (jc) =>
            `${jc.joinType.toUpperCase()} JOIN ${jc.table} ${jc.alias}
        ON ${jc.leftField} = ${jc.rightField}`,
        )
        .join('\n')
    : '';

  let whereSql: string;
  if (typeof where === 'object') {
    const expr2Sql = Array.isArray(where.expr2)
      ? `(${where.expr2.join(',')})`
      : toSql(where.expr2 as Expr<unknown>);
    whereSql = `WHERE ${toSql(where.expr1)} ${where.op} ${expr2Sql}`;
  } else if (typeof where === 'string') {
    whereSql = `WHERE ${where}`;
  } else {
    whereSql = '';
  }

  const groupBySql = groupBy?.length ? `GROUP BY ${groupBy}` : '';
  const havingSql = having ? `HAVING ${having}` : '';

  const sql = `
    SELECT ${selectSql}
    FROM ${from} ${fromAlias}
    ${joinSql}
    ${whereSql}
    ${groupBySql}
    ${havingSql};  
  `;
  return format(sql);
};
