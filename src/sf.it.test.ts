import { Connection, createConnection } from 'snowflake-sdk';
import { AllTables } from '../test/fixtures';
import { Db } from './db';
import { dbName, roleName, schemaName, seed, whName } from '../test/seed';
import { getEnvOrThrow } from './utils';
import { destroy } from './sf-promise';
import * as dotenv from 'dotenv';

dotenv.config();

jest.setTimeout(20 * 1000);

describe.only('SF IT', () => {
  let db: Db<AllTables>;
  let conn: Connection;

  beforeAll(async () => {
    conn = createConnection({
      account: getEnvOrThrow('ACCOUNT'),
      username: getEnvOrThrow('IT_USERNAME'),
      password: getEnvOrThrow('IT_PASSWORD'),
      role: roleName,
      warehouse: whName,
      database: dbName,
      schema: schemaName,
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
      .select((f) => [
        'o.user_id',
        f.count('*').as('num_trans'),
        f.sum('o.total').as('total_spend'),
      ])
      .where('o.user_id = 1')
      .groupBy('o.user_id')
      .findOne();

    const expected: typeof actual = {
      USER_ID: 1,
      NUM_TRANS: 2,
      TOTAL_SPEND: 24.66,
    };
    expect(actual).toEqual(expected);
  });
});
