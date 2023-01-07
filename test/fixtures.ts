import { DBConfig, TableFromConfig, TConfig } from '../src/util-types';
import { dbName, schemaName } from './config';

export const users = {
  tRef: { db: dbName, schema: schemaName, table: 'users' },
  tSchema: {
    user_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
    email: { _type: 'varchar', nullable: false },
    is_verified: { _type: 'boolean', nullable: false },
    first_name: { _type: 'varchar', nullable: false },
    last_name: { _type: 'varchar', nullable: true },
  },
} satisfies TConfig;

export const orders = {
  tRef: { db: dbName, schema: schemaName, table: 'orders' },
  tSchema: {
    order_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
    user_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
    order_date: { _type: 'date', nullable: false },
    total: { _type: 'number', precision: 38, scale: 2, nullable: false },
  },
} satisfies TConfig;

export const order_items = {
  tRef: { db: dbName, schema: schemaName, table: 'order_items' },
  tSchema: {
    order_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
    sku: { _type: 'varchar', nullable: false },
    quantity: { _type: 'number', precision: 38, scale: 0, nullable: false },
    line_total: { _type: 'number', precision: 38, scale: 2, nullable: false },
  },
} satisfies TConfig;

export const currencies = {
  tRef: { db: dbName, schema: schemaName, table: 'currencies' },
  tSchema: {
    full_name: { _type: 'varchar', nullable: false },
    max_denom: { _type: 'number', precision: 38, scale: 2, nullable: true },
    is_active: { _type: 'boolean', nullable: false },
    created_date: { _type: 'date', nullable: false },
    created_ts: { _type: 'timestamp', nullable: false },
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
