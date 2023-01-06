import { QueryConfig } from '../query-config';
import { HavingBuilder } from './having-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { Executable } from './executable';
import { orderByFns, OrderByFns } from '../sf-functions';
import { OrderByBuilder } from './order-by-builder';
import { Ordered } from './from-builder';
import { Table } from '../util-types';

export class GroupByBuilder<
  Fields extends Table,
  RType extends Table,
> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  having(raw: string): HavingBuilder<Fields, RType> {
    return new HavingBuilder<Fields, RType>(this.sf, {
      ...this.queryConfig,
      having: raw,
    });
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
