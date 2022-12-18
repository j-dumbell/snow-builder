import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { GroupByBuilder } from './group-by-builder';

export class WhereBuilder<T> {
  constructor(public queryConfig: QueryConfig) {}

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
