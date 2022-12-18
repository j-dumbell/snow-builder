import { FromBuilder } from './from-builder';
import { AllTables } from '../../test/fixtures';
import { PrefixKeys } from '../util-types';
import { QueryConfig } from '../query-config';

describe('FromBuilder', () => {
  const initialQueryConfig = {
    select: [],
    from: 'users',
    fromAlias: 'u',
  };
  const fb = new FromBuilder<AllTables, PrefixKeys<AllTables['users'], 'u'>>(
    initialQueryConfig,
  );

  it('innerJoin', () => {
    const actual = fb.innerJoin('orders', 'o', 'u.userId', 'o.userId');
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'inner',
          table: 'orders',
          alias: 'o',
          leftField: 'u.userId',
          rightField: 'o.userId',
        },
      ],
    };

    expect(actual).toBeInstanceOf(FromBuilder);
    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });

  it('leftJoin', () => {
    const actual = fb.leftJoin('orders', 'or', 'u.isVerified', 'or.orderDate');
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'left',
          table: 'orders',
          alias: 'or',
          leftField: 'u.isVerified',
          rightField: 'or.orderDate',
        },
      ],
    };

    expect(actual).toBeInstanceOf(FromBuilder);
    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });

  it('rightJoin', () => {
    const actual = fb.rightJoin('users', 'users', 'u.userId', 'users.email');
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'right',
          table: 'users',
          alias: 'users',
          leftField: 'u.userId',
          rightField: 'users.email',
        },
      ],
    };

    expect(actual).toBeInstanceOf(FromBuilder);
    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });
});
