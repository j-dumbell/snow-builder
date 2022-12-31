import { QueryConfig } from '../query-config';
import { LimitBuilder } from './limit-builder';
import { Executable } from './executable';
import { Connection } from 'snowflake-sdk';

export class HavingBuilder<RType> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  limit(n: number): LimitBuilder<RType> {
    return new LimitBuilder<RType>(this.sf, { ...this.queryConfig, limit: n });
  }
}
