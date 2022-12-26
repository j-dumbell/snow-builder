import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { HavingBuilder } from './having-builder';
import { LimitBuilder } from './limit-builder';

export class GroupByBuilder {
  constructor(public queryConfig: QueryConfig) {}

  having(raw: string): HavingBuilder {
    return new HavingBuilder({ ...this.queryConfig, having: raw });
  }

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
