import { QueryConfig } from '../query-config';
import { WhereBuilder } from './where-builder';
import { GroupByBuilder } from './group-by-builder';
import { compile } from '../compile';
import { LimitBuilder } from './limit-builder';

export class SelectBuilder<Fields, RType> {
  constructor(public queryConfig: QueryConfig) {}

  where(raw: string): WhereBuilder<Fields> {
    return new WhereBuilder({ ...this.queryConfig, where: raw });
  }

  groupBy(...fields: (keyof Fields & string)[]): GroupByBuilder {
    return new GroupByBuilder({ ...this.queryConfig, groupBy: fields });
  }

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  //ToDo
  execute(): RType {
    return '' as unknown as RType;
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
