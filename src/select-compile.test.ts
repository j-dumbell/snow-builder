import { QueryConfig } from './query-config';
import { selectCompile, sqlFormat } from './select-compile';
import { Aliased, Ordered } from './builders/from-builder';
import { SFType, ValidFirstCharAlias } from './util-types';

type TestConfig = {
  name: string;
  queryConfig: QueryConfig;
  expected: string;
};

const testConfigs: TestConfig[] = [
  {
    name: 'all configs',
    queryConfig: {
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
      select: ['u.userId', 'u.isVerified', new Aliased<SFType, ValidFirstCharAlias>('count()', 'cnt')],
      where: 'isVerified = true',
      groupBy: ['u.userId'],
      having: 'COUNT() > 1',
      orderBy: [
        new Ordered('u.userId', 'desc'),
        new Ordered('u.isVerified', 'asc'),
      ],
      limit: 10,
    },
    expected: `
      SELECT count() cnt, u.isVerified, u.userId
      FROM users u
      INNER JOIN orders o
          ON u.userId = o.userId
      WHERE isVerified = true
      GROUP BY u.userId
      HAVING COUNT() > 1
      ORDER BY u.userId desc, u.isVerified asc
      LIMIT 10
    `,
  },

  {
    name: 'select only',
    queryConfig: {
      from: 'users',
      fromAlias: 'us',
      select: ['us.userId', 'us.some_field'],
    },
    expected: `
      SELECT us.some_field, us.userId
      FROM users us
    `,
  },

  {
    name: 'select, group by',
    queryConfig: {
      from: 'm_ints',
      fromAlias: 'm_',
      select: ['m_.id', new Aliased<number, 'totes'>('SUM(m_.total)', 'totes')],
      groupBy: ['m._id'],
    },
    expected: `
      SELECT m_.id, SUM(m_.total) totes
      FROM m_ints m_
      GROUP BY m._id
    `,
  },
];

describe('selectCompile', () => {
  test.each(testConfigs)('$name', ({ queryConfig, expected }) => {
    const actual = selectCompile(queryConfig);
    expect(actual).toEqual(sqlFormat(expected));
  });
});
