import { Connection } from 'snowflake-sdk';
import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { findMany, findOne } from '../sf-promise';

export class Executable<RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, compile(this.queryConfig));
  }

  findMany(): Promise<RType[]> {
    return findMany<RType>(this.sf, compile(this.queryConfig));
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
