import { QueryConfig } from './query-config';
import { compile } from './compile';
import { format } from 'sql-formatter';

describe('compile', () => {
  it('all properties set', () => {
    const queryConfig: QueryConfig = {
      from: 'users',
      fromAlias: 'u',
      joins: [
        {
          joinType: 'inner',
          table: 'orders',
          alias: 'o',
          leftField: 'u.userId',
          rightField: 'o.userId',
        },
      ],
      select: ['u.userId', 'u.isVerified', 'COUNT()'],
      where: 'isVerified is true',
      groupBy: ['u.userId'],
      having: 'COUNT() > 1',
    };

    const expected = format(`
        SELECT u.userId, u.isVerified, COUNT()
        FROM users u
        INNER JOIN orders o
            ON u.userId = o.userId
        WHERE isVerified is true
        GROUP BY u.userId
        HAVING COUNT() > 1;
    `);

    expect(compile(queryConfig)).toEqual(expected);
  });
});
