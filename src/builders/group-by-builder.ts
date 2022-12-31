import { QueryConfig } from '../query-config';
import { HavingBuilder } from './having-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { Executable } from './executable';

export class GroupByBuilder<RType> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  having(raw: string): HavingBuilder<RType> {
    return new HavingBuilder<RType>(this.sf, {
      ...this.queryConfig,
      having: raw,
    });
  }

  limit(n: number): LimitBuilder<RType> {
    return new LimitBuilder<RType>(this.sf, { ...this.queryConfig, limit: n });
  }
}
