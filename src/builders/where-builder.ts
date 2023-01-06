import { QueryConfig } from '../query-config';
import { GroupByBuilder } from './group-by-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { Executable } from './executable';
import { OrderByBuilder } from './order-by-builder';
import { orderByFns, OrderByFns } from '../sf-functions';
import { Ordered } from './from-builder';
import { Table } from '../util-types';

export class WhereBuilder<
  Fields extends Table,
  RType extends Table,
> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  groupBy(...fields: (keyof Fields & string)[]): GroupByBuilder<Fields, RType> {
    return new GroupByBuilder<Fields, RType>(this.sf, {
      ...this.queryConfig,
      groupBy: fields,
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
