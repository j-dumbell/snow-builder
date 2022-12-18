import { OnlyString, PrefixKeys, Selectable } from './util-types';
import { FromBuilder } from './builders/from-builder';

class Db<DB> {
  selectFrom<T extends keyof DB & string, S extends string>(
    table: T,
    alias: S,
  ): FromBuilder<DB, PrefixKeys<DB[T], S>> {
    return new FromBuilder<DB, PrefixKeys<DB[T], S>>({
      from: table,
      fromAlias: alias,
      groupBy: [],
      joins: [],
      select: [],
    });
  }
}

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

const db = new Db<AllTables>();

const query = db
  .selectFrom('users', 'u')
  .rightJoin('orders', 'o', 'u.userId', 'o.orderId')
  .select('u.email', 'u.email', 'o.orderDate', 'o.userId')
  // .where('blah')
  .groupBy('u.email')
  .having('bas')
  .compile();

console.log(query);
