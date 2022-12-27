import { QueryConfig } from '../query-config';
import { WhereBuilder } from './where-builder';
import { GroupByBuilder } from './group-by-builder';
import { compile } from '../compile';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { execute, findOne } from '../sf-promise';

export class SelectBuilder<Fields, RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  where(raw: string): WhereBuilder<Fields, RType> {
    return new WhereBuilder(this.sf, { ...this.queryConfig, where: raw });
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
