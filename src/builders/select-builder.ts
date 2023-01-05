import { QueryConfig } from '../query-config';
import { WhereBuilder } from './where-builder';
import { GroupByBuilder } from './group-by-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import {
  Condition,
  OrderByFns,
  orderByFns,
  whereFns,
  WhereFns,
} from '../sf-functions';
import { SFType, Table } from '../util-types';
import { Executable } from './executable';
import { OrderByBuilder } from './order-by-builder';
import { Ordered } from './from-builder';

export type ComparisonOp =
  | '='
  | '!='
  | '>='
  | '>'
  | '<'
  | '=<'
  | 'in'
  | 'not in';

export class SelectBuilder<
  Fields extends Table,
  RType,
> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  where(sql: string): WhereBuilder<Fields, RType>;
  where<FName extends keyof Fields & string, Op extends ComparisonOp>(
    field: FName,
    op: Op,
    value: Op extends 'in' | 'not in' ? Fields[FName][] : Fields[FName],
  ): WhereBuilder<Fields, RType>;
  where(fn: (f: WhereFns<Fields>) => Condition): WhereBuilder<Fields, RType>;
  where(
    arg1: string | ((f: WhereFns<Fields>) => Condition),
    arg2?: ComparisonOp,
    arg3?: unknown,
  ): WhereBuilder<Fields, RType> {
    const whereFunctions = whereFns<Fields>();
    let where: string | Condition;
    if (typeof arg1 === 'function') {
      where = arg1(whereFunctions);
    } else if (arg2) {
      where = {
        expr1: arg1,
        op: arg2,
        expr2: arg3 as SFType | string[] | number[] | Date[] | boolean[],
      };
    } else {
      where = arg1;
    }

    return new WhereBuilder(this.sf, { ...this.queryConfig, where });
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
