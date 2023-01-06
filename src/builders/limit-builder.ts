import { QueryConfig } from '../query-config';
import { Executable } from './executable';
import { Connection } from 'snowflake-sdk';
import { Table } from '../util-types';

export class LimitBuilder<RType extends Table> extends Executable<RType> {
  constructor(sf: Connection, queryConfig: QueryConfig) {
    super(sf, queryConfig);
  }
}
