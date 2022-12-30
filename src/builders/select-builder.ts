import { QueryConfig } from '../query-config';
import { WhereBuilder } from './where-builder';
import { GroupByBuilder } from './group-by-builder';
import { compile } from '../compile';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { execute, findOne } from '../sf-promise';
import { Condition, whereFns, WhereFns } from '../sf-functions';
import { KeysMatchingType } from '../util-types';

export type ComparisonOp =
  | '='
  | '!='
  | '>='
  | '>'
  | '<'
  | '=<'
  | 'in'
  | 'not in';

export class SelectBuilder<Fields, RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  where(sql: string): WhereBuilder<Fields, RType>;
  where<FName extends keyof Fields & string, Op extends ComparisonOp>(
    field: FName,
    op: Op,
    value: Op extends 'in' | 'not in'
      ? Fields[FName][]
      : Fields[FName] | KeysMatchingType<Fields, Fields[FName]>,
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
      where = { expr1: arg1, op: arg2, expr2: arg3 };
    } else {
      where = arg1;
    }
    return new WhereBuilder(this.sf, { ...this.queryConfig, where });
  }

  groupBy(...fields: (keyof Fields & string)[]): GroupByBuilder<RType> {
    return new GroupByBuilder<RType>(this.sf, {
      ...this.queryConfig,
      groupBy: fields,
    });
  }

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  async findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, compile(this.queryConfig));
  }

  findMany(): Promise<RType[] | undefined> {
    return execute<RType>(this.sf, compile(this.queryConfig));
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
