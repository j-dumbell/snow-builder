<h1 align="center">snow-builder</h1>

<p align="center">
    <a href="https://github.com/j-dumbell/snow-builder/actions/workflows/test.yml">
      <img src="https://github.com/j-dumbell/snow-builder/actions/workflows/test.yml/badge.svg?branch=main" />
    </a>
    <a href="https://github.com/j-dumbell/snow-builder/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    </a>
    <a href="https://www.npmjs.com/package/snow-builder">
      <img src="https://badge.fury.io/js/snow-builder.svg" />
    </a>
</p>

## About
Type-safe NodeJS query builder library for [Snowflake](https://www.snowflake.com/en/) with smart return type inference, written in Typescript.


## Usage
```typescript
import { TConfig, sNumber, sVarchar, sBoolean, DBConfig, Db } from 'snow-builder/dist/index';

const users = {
  tRef: { db: dbName, schema: schemaName, table: 'users' },
  tSchema: {
    user_id: sNumber(38, 0).notNull(),
    email: sVarchar().notNull(),
    is_verified: sBoolean().notNull(),
    first_name: sVarchar(),
  },
} satisfies TConfig;

const orders = {
  tRef: { db: dbName, schema: schemaName, table: 'orders' },
  tSchema: {
    order_id: sNumber(38, 0).notNull(),
    user_id: sNumber(38, 0).notNull(),
    order_date: sDate().notNull(),
    total: sNumber(38, 2).notNull(),
  },
} satisfies TConfig;

const dbConfig = {
  users,
  orders,
} satisfies DBConfig;

const db = new Db(conn, dbConfig);

const result = await db
  .selectFrom('users', 'u')
  .innerJoin('users', 'u', 'o.user_id', 'u.user_id')
  .select((f) => [
    'u.user_id',
    f.sum('o.total').as('user_total'),
  ])
  .where('u.is_verified', '=', true)
  .groupBy('u.user_id)
  .orderBy('u.first_name')
  .limit(10);
```
