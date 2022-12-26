import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { GroupByBuilder } from './group-by-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { connectAndExecute, findOne } from '../sf-promise';

export class WhereBuilder<T, RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder<RType> {
    return new GroupByBuilder(this.sf, {
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
    return connectAndExecute<RType>(this.sf, compile(this.queryConfig));
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
