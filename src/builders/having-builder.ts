import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { LimitBuilder } from './limit-builder';

export class HavingBuilder {
  constructor(public queryConfig: QueryConfig) {}

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
