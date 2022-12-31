import { QueryConfig } from '../query-config';
import { GroupByBuilder } from './group-by-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { Executable } from './executable';

export class WhereBuilder<T, RType> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder<RType> {
    return new GroupByBuilder(this.sf, {
      ...this.queryConfig,
      groupBy: fields,
    });
  }

  limit(n: number): LimitBuilder<RType> {
    return new LimitBuilder<RType>(this.sf, { ...this.queryConfig, limit: n });
  }
}
