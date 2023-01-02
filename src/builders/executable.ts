import { Connection } from 'snowflake-sdk';
import { selectCompile } from '../select-compile';
import { QueryConfig } from '../query-config';
import { findMany, findOne } from '../sf-promise';

export class Executable<RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, selectCompile(this.queryConfig));
  }

  findMany(): Promise<RType[]> {
    return findMany<RType>(this.sf, selectCompile(this.queryConfig));
  }

  compile(): string {
    return selectCompile(this.queryConfig);
  }
}
