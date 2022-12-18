import { compile } from '../compile';
import { QueryConfig } from '../query-config';

export class HavingBuilder {
  constructor(public queryConfig: QueryConfig) {}

  compile(): string {
    return compile(this.queryConfig);
  }
}
