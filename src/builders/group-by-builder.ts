import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { HavingBuilder } from './having-builder';

export class GroupByBuilder {
  constructor(public queryConfig: QueryConfig) {}

  having(raw: string): HavingBuilder {
    return new HavingBuilder({ ...this.queryConfig, having: raw });
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
