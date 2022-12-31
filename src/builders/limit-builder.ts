import { QueryConfig } from '../query-config';
import { Executable } from './executable';
import { Connection } from 'snowflake-sdk';

export class LimitBuilder<RType> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }
}
