import { s } from './builders/from-builder';
import { Connection, createConnection } from 'snowflake-sdk';
import { Db } from './db';

type Users = {
  userId: number;
  email: string;
  isVerified: boolean;
};

type Orders = {
  orderId: number;
  userId: number;
  orderDate: Date;
};

type AllTables = {
  users: Users;
  orders: Orders;
};

const db = new Db<AllTables>({} as Connection);

const query = db
  .selectFrom('users', 'u')
  .rightJoin('orders', 'o', 'u.userId', 'o.orderId')
  .select((f) => [
    f.sum('o.orderId', ['u.userId', 'o.orderDate']).as('blah'),
    'o.orderId',
    s('asd').as('asd'),
    f.toDate('u.email').as('poop'),
  ])
  .findOne();

// .groupBy('u.email')
// .having('bas')
// .limit(10)
// .compile();
