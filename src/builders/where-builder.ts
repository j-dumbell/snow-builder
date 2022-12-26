import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { GroupByBuilder } from './group-by-builder';
import { LimitBuilder } from './limit-builder';

export class WhereBuilder<T> {
  constructor(public queryConfig: QueryConfig) {}

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
