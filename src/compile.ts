import { QueryConfig } from './query-config';
import { format } from 'sql-formatter';

export const compile = (queryConfig: QueryConfig): string => {
  const { select, from, fromAlias, where, joins, groupBy, having } =
    queryConfig;

  const selectSql = select.join(',\n\t');
  const joinSql = joins
    ? joins
        .map(
          (jc) =>
            `${jc.joinType.toUpperCase()} JOIN ${jc.table} ${jc.alias}
        ON ${jc.leftField} = ${jc.rightField}`,
        )
        .join('\n')
    : '';

  const whereSql = where ? `WHERE ${where}` : '';
  const groupBySql = groupBy ? `GROUP BY ${groupBy}` : '';
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
