import { FromBuilder } from './from-builder';
import { AllTables } from '../../test/fixtures';
import { PrefixKeys } from '../util-types';
import { QueryConfig } from '../query-config';
import { Connection } from 'snowflake-sdk';

describe('FromBuilder', () => {
  const initialQueryConfig = {
    select: [],
    from: 'users',
    fromAlias: 'u',
  };
  const fb = new FromBuilder<AllTables, PrefixKeys<AllTables['users'], 'u'>>(
    {} as Connection,
    initialQueryConfig,
  );

  it('innerJoin', () => {
    const actual = fb.innerJoin('orders', 'o', 'u.user_id', 'o.user_id');
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'inner',
          table: 'orders',
          alias: 'o',
          leftField: 'u.user_id',
          rightField: 'o.user_id',
        },
      ],
    };

    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });

  it('leftJoin', () => {
    const actual = fb.leftJoin(
      'orders',
      'or',
      'u.is_verified',
      'or.order_date',
    );
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'left',
          table: 'orders',
          alias: 'or',
          leftField: 'u.is_verified',
          rightField: 'or.order_date',
        },
      ],
    };

    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });

  it('rightJoin', () => {
    const actual = fb.rightJoin('users', 'users', 'u.user_id', 'users.email');
    const expectedQueryConfig: QueryConfig = {
      ...initialQueryConfig,
      joins: [
        {
          joinType: 'right',
          table: 'users',
          alias: 'users',
          leftField: 'u.user_id',
          rightField: 'users.email',
        },
      ],
    };

    expect(actual.queryConfig).toEqual(expectedQueryConfig);
  });
});
