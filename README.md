<h1 align="center">snow-builder</h1>

<p align="center">
Type-safe NodeJS query builder library for <a href="https://www.snowflake.com/en/">Snowflake</a> with smart return type inference, written in Typescript.
</p>

<p align="center">
    <a href="https://github.com/j-dumbell/snow-builder/actions/workflows/test.yml">
      <img src="https://github.com/j-dumbell/snow-builder/actions/workflows/test.yml/badge.svg?branch=main" />
    </a>
    <a href="https://github.com/j-dumbell/snow-builder/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    </a>
    <a href="https://badge.fury.io/js/snow-builder">
        <img src="https://badge.fury.io/js/snow-builder.svg">
    </a>
</p>

<br/>

## Features
---

Supports the following SQL operations in Snowflake:
- `SELECT` statements, including all SQL clauses and subqueries.
- `INSERT INTO` rows directly, or the result of a `SELECT` query.
- `CREATE TABLE`

## Usage
---
### DB configuration

Instantiate a `Db` instance by passing a [Snowflake NodeJS SDK connection](https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#establishing-connections) and table definitions.  Managing the lifecycle of the Snowflake connection (e.g. connecting & destroying) is not handled by snow-builder.

```typescript
import {
  TConfig,
  sNumber,
  sVarchar,
  sBoolean,
  DBConfig,
  Db,
} from 'snow-builder';

const users = {
  tRef: { db: 'foo', schema: 'bar', table: 'users' },
  tSchema: {
    user_id: sNumber(38, 0).notNull(),
    email: sVarchar().notNull(),
    is_verified: sBoolean().notNull(),
    first_name: sVarchar(),
  },
} satisfies TConfig;

const orders = {
  tRef: { db: 'foo', schema: 'bar', table: 'orders' },
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
```

### Select queries
```typescript
const result = await db
  .selectFrom('users', 'u')
  .innerJoin('users', 'u', 'o.user_id', 'u.user_id')
  .select((f) => ['u.user_id', f.sum('o.total').as('user_total')])
  .where('u.is_verified', '=', true)
  .groupBy('u.user_id')
  .orderBy('u.first_name')
  .limit(10)
  .findMany();
```

### Inserts

**From Records**

Use the generic type `TInsert` together with the table's `tSchema` property to create the corresponding object type.  Snowflake column types are mapped to object properties as per the [Snowflake NodeJS SDK mapping](https://docs.snowflake.com/en/user-guide/nodejs-driver-use.html#data-type-casting).  Nullable columns are represented by optional properties.
```typescript
import { TInsert } from 'snow-builder';

type User = TInsert<typeof users.tSchema>;

const newUsers: User[] = [
  {
    user_id: 1,
    email: 'blah@gmail.com',
    is_verified: true,
    // 'first_name' is optional since nullable
  },
];

const result = await db.insertInto('users', newUsers);
```

**From Select**

The select query's return type must resolve to the same type as the table's corresponding object type (after calling `TInsert`). Nullable fields in the table may be omitted from the select query.
```typescript
const query = db
  .selectFrom('orders', 'o')
  .select((f) => [
    'o.user_id', 
    s<string>(`'new_email@gmail.com'`).as('email'),
    s<boolean>('true').as('is_verified'),
  ])
  .where('o.user_id', '=', 1)
  .limit(1);

const result = await db.insertInto('users', query);
```
