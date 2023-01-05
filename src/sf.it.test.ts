import { Connection, createConnection } from 'snowflake-sdk';
import { AllTables, Currency } from '../test/fixtures';
import { Db } from './db';
import { dbName, roleName, schemaName, seed, whName } from '../test/seed';
import { getEnvOrThrow } from './utils';
import { destroy } from './sf-promise';
import * as dotenv from 'dotenv';
import { execute } from './sf-promise';

dotenv.config();
jest.setTimeout(20 * 1000);

describe('SF IT', () => {
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

  describe('selectFrom', () => {
    describe('findOne', () => {
      it('leftJoin, where, groupBy', async () => {
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

      it('where - no results', async () => {
        const actual = await db
          .selectFrom('users', 'us')
          .select(['us.email'])
          .where((f) => f.c(f.len('us.first_name'), '=', f.len('us.email')))
          .findOne();

        expect(actual).toEqual(undefined);
      });
    });

    describe('findMany', () => {
      it('inner join', async () => {
        const actual = await db
          .selectFrom('orders', 'o')
          .innerJoin('users', 'u', 'o.user_id', 'u.user_id')
          .select((f) => [
            'o.user_id',
            f.s('o.total').as('order_total'),
            'u.email',
            'u.last_name',
          ])
          .findMany();

        const expected: typeof actual = [
          {
            USER_ID: 1,
            ORDER_TOTAL: 19.5,
            EMAIL: 'jrogers@gmail.com',
            LAST_NAME: 'Rogers',
          },
          {
            USER_ID: 1,
            ORDER_TOTAL: 5.16,
            EMAIL: 'jrogers@gmail.com',
            LAST_NAME: 'Rogers',
          },
        ];
        expect(actual).toEqual(expected);
      });

      it('where - no results', async () => {
        const actual = await db
          .selectFrom('orders', 'ord')
          .select(['ord.user_id'])
          .where('ord.user_id', 'in', [100, 101])
          .findMany();

        expect(actual).toEqual([]);
      });

      it('subquery', async () => {
        const subquery = db
          .selectFrom('orders', 'o')
          .select((f) => ['o.user_id', f.sum('o.total').as('total_spend')])
          .where('o.user_id', '=', 1)
          .groupBy('o.user_id')

        const actual = await db
          .selectFrom('users', 'u')
          .innerJoin(subquery, 'sq', 'u.user_id', 'sq.USER_ID')
          .select(['u.user_id', 'u.first_name', 'sq.TOTAL_SPEND'])
          .findMany();

        expect(actual).toEqual([{USER_ID: 1, FIRST_NAME: 'James', TOTAL_SPEND: 24.66}]);
      });
    });
  });

  describe('insertInto', () => {
    afterEach(async () => {
      await execute(conn, 'TRUNCATE TABLE currencies');
    });

    describe('from records', () => {
      it('should insert records when non-empty', async () => {
        const usd: Currency = {
          full_name: 'United States Dollar',
          created_date: new Date('2022-10-01'),
          created_ts: new Date(),
          max_denom: 100,
          is_active: true,
        };
        const gbp: Currency = {
          full_name: 'Great British Pound',
          created_date: new Date('2021-11-30'),
          created_ts: new Date(),
          max_denom: 50,
          is_active: false,
        };
        const toInsert: Currency[] = [usd, gbp];
        await db.insertInto('currencies', toInsert);

        const actual = await execute(conn, 'SELECT * FROM currencies;');
        const expected = [
          {
            FULL_NAME: usd.full_name,
            CREATED_DATE: usd.created_date,
            CREATED_TS: usd.created_ts,
            MAX_DENOM: usd.max_denom,
            IS_ACTIVE: usd.is_active,
          },
          {
            FULL_NAME: gbp.full_name,
            CREATED_DATE: gbp.created_date,
            CREATED_TS: gbp.created_ts,
            MAX_DENOM: gbp.max_denom,
            IS_ACTIVE: gbp.is_active,
          },
        ];
        expect(actual).toEqual(expected);
      });

      it('should do nothing when no records are provided', async () => {
        await db.insertInto('currencies', []);

        const actual = await execute(conn, 'SELECT * FROM currencies;');
        expect(actual).toEqual([]);
      });
    });

    describe('from select', () => {
      it('currencies', async () => {
        const select = db
          .selectFrom('currencies', 'c')
          .select([
            'c.created_date',
            'c.created_ts',
            'c.full_name',
            'c.is_active',
            'c.max_denom',
          ]);

        await db.insertInto('currencies', select);
      });
    });
  });
});
