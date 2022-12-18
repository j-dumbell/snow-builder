import { QueryConfig } from '../query-config';
import { WhereBuilder } from './where-builder';
import { GroupByBuilder } from './group-by-builder';
import { compile } from '../compile';

export class SelectBuilder<T> {
  constructor(public queryConfig: QueryConfig) {}

  where(raw: string): WhereBuilder<T> {
    return new WhereBuilder({ ...this.queryConfig, where: raw });
  }

  groupBy(...fields: (keyof T & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
