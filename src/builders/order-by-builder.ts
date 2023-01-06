import { Connection } from 'snowflake-sdk';
import { QueryConfig } from '../query-config';
import { Table } from '../util-types';
import { Executable } from './executable';
import { LimitBuilder } from './limit-builder';

export class OrderByBuilder<RType extends Table> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }

  limit(n: number): LimitBuilder<RType> {
    return new LimitBuilder<RType>(this.sf, { ...this.queryConfig, limit: n });
  }
}
