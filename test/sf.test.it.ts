import { Connection, createConnection } from 'snowflake-sdk';
import { AllTables } from './fixtures';
import { Db } from '../src/db';
import { roleName, seed } from './seed';
import { getEnvOrThrow } from '../src/utils';
import { destroy } from '../src/sf-promise';

describe('SF IT', () => {
  let db: Db<AllTables>;
  let conn: Connection;

  beforeAll(async () => {
    conn = createConnection({
      account: getEnvOrThrow('ACCOUNT'),
      username: getEnvOrThrow('IT_USERNAME'),
      password: getEnvOrThrow('IT_PASSWORD'),
      role: roleName,
    });

    await seed(conn);

    db = new Db<AllTables>(conn);
  });

  afterAll(async () => {
    await destroy(conn);
  });

  it('findOne', async () => {
    const actual = await db
      .selectFrom('orders', 'o')
      .leftJoin('users', 'u', 'o.user_id', 'u.user_id')
      .select((f) => ['o.user_id', f.count().as('num_trans')])
      .where('o.userId = 1')
      .groupBy('o.user_id')
      .findMany();

    const expected: { userId: number; num_trans: number }[] = [
      { userId: 1, num_trans: 1 },
      { userId: 1, num_trans: 1 },
    ];
    expect(actual).toEqual(expected);
  });
});
