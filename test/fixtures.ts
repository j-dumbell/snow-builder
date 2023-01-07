import { DBConfig, TConfig } from '../src/util-types';

const users = {
  user_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
  email: { _type: 'varchar', nullable: false },
  is_verified: { _type: 'boolean', nullable: false },
  first_name: { _type: 'varchar', nullable: false },
  last_name: { _type: 'varchar', nullable: true },
} satisfies TConfig;

const orders = {
  order_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
  user_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
  order_date: { _type: 'date', nullable: false },
  total: { _type: 'number', precision: 38, scale: 2, nullable: false },
} satisfies TConfig;

const order_items = {
  order_id: { _type: 'number', precision: 38, scale: 0, nullable: false },
  sku: { _type: 'varchar', nullable: false },
  quantity: { _type: 'number', precision: 38, scale: 0, nullable: false },
  line_total: { _type: 'number', precision: 38, scale: 2, nullable: false },
} satisfies TConfig;

const currencies = {
  full_name: { _type: 'varchar', nullable: false },
  max_denom: { _type: 'number', precision: 38, scale: 2, nullable: true },
  is_active: { _type: 'boolean', nullable: false },
  created_date: { _type: 'date', nullable: false },
  created_ts: { _type: 'timestamp', nullable: false },
} satisfies TConfig;

export const dbConfig = {
  users,
  orders,
  order_items,
  currencies,
} satisfies DBConfig;
