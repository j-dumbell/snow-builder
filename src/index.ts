import { PrefixKeys } from './util-types';
import { FromBuilder, s } from './builders/from-builder';

class Db<DB> {
  selectFrom<TName extends keyof DB & string, TAlias extends string>(
    table: TName,
    alias: TAlias,
  ): FromBuilder<DB, PrefixKeys<DB[TName], TAlias>> {
    return new FromBuilder<DB, PrefixKeys<DB[TName], TAlias>>({
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
  .select((f) => [
    f.sum('o.orderId', ['u.userId', 'o.orderDate']).as('blah'),
    'o.orderId',
    s('asd').as('asd'),
    f.toDate('u.email').as('poop'),
  ])
  .execute();

// .groupBy('u.email')
// .having('bas')
// .limit(10)
// .compile();
