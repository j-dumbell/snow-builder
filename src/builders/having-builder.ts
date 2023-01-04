import { QueryConfig } from '../query-config';
import { LimitBuilder } from './limit-builder';
import { Executable } from './executable';
import { Connection } from 'snowflake-sdk';
import { orderByFns, OrderByFns } from '../sf-functions';
import { Ordered } from './from-builder';
import { OrderByBuilder } from './order-by-builder';

export class HavingBuilder<Fields, RType> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  orderBy(fn: (f: OrderByFns<Fields>) => Ordered[]): OrderByBuilder<RType> {
    return new OrderByBuilder<RType>(this.sf, {
      ...this.queryConfig,
      orderBy: fn(orderByFns<Fields>()),
    });
  }

  limit(n: number): LimitBuilder<RType> {
    return new LimitBuilder<RType>(this.sf, { ...this.queryConfig, limit: n });
  }
}
