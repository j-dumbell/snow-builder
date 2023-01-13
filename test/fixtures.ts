import { SBoolean, SDate, SNumber, STimestamp, SVarchar } from '../src/s-types';
import { DBConfig, TableFromConfig, TConfig } from '../src/util-types';
import { dbName, schemaName } from './config';

export const users = {
  tRef: { db: dbName, schema: schemaName, table: 'users' },
  tSchema: {
    user_id: new SNumber(20,0).notNull(),
    email: new SVarchar().notNull(),
    is_verified: new SBoolean().notNull(),
    first_name: new SVarchar().notNull(),
    last_name: new SVarchar(),
  },
} satisfies TConfig;

export const orders = {
  tRef: { db: dbName, schema: schemaName, table: 'orders' },
  tSchema: {
    order_id: new SNumber(38,0).notNull(),
    user_id: new SNumber(20,0).notNull(),
    order_date: new SDate().notNull(),
    total: new SNumber(38,2).notNull(),
  },
} satisfies TConfig;

export const order_items = {
  tRef: { db: dbName, schema: schemaName, table: 'order_items' },
  tSchema: {
    order_id: new SNumber(38,0).notNull(),
    sku: new SVarchar().notNull(),
    quantity: new SNumber(38,0).notNull(),
    line_total: new SNumber(38,2).notNull(),
  },
} satisfies TConfig;

export const currencies = {
  tRef: { db: dbName, schema: schemaName, table: 'currencies' },
  tSchema: {
    full_name: new SVarchar().notNull(),
    max_denom: new SNumber(38,2),
    is_active: new SBoolean().notNull(),
    created_date: new SDate().notNull(),
    created_ts: new STimestamp().notNull(),
  },
} satisfies TConfig;

export const dbConfig = {
  users,
  orders,
  order_items,
  currencies,
} satisfies DBConfig;

export const usersRecords: TableFromConfig<typeof users.tSchema>[] = [
  {
    user_id: 1,
    email: 'jrogers@gmail.com',
    is_verified: true,
    first_name: 'James',
    last_name: 'Rogers',
  },
  {
    user_id: 2,
    email: 'bmurray@gmail.com',
    is_verified: false,
    first_name: 'Bill',
    last_name: 'Murray',
  },
];

export const ordersRecords: TableFromConfig<typeof orders.tSchema>[] = [
  { order_id: 1, user_id: 1, order_date: new Date('2022-12-10'), total: 19.5 },
  { order_id: 2, user_id: 1, order_date: new Date('2022-11-30'), total: 5.16 },
];

export const orderItemsRecords: TableFromConfig<typeof order_items.tSchema>[] =
  [
    { order_id: 1, sku: 'microwave', quantity: 1, line_total: 19.5 },
    { order_id: 2, sku: 'batteries', quantity: 1, line_total: 2 },
    { order_id: 2, sku: 'paper', quantity: 1, line_total: 3.16 },
  ];
