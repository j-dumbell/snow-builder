import { Connection } from 'snowflake-sdk';
import { selectCompile } from '../select-compile';
import { QueryConfig } from '../query-config';
import { findMany, findOne, streamRows } from '../sf-promise';
import { Table } from '../util-types';
import { Readable } from 'stream';

export class Executable<RType extends Table> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, selectCompile(this.queryConfig));
  }

  findMany(): Promise<RType[]> {
    return findMany<RType>(this.sf, selectCompile(this.queryConfig));
  }

  streamRows(): Readable {
    return streamRows(this.sf, selectCompile(this.queryConfig));
  }

  compile(): string {
    return selectCompile(this.queryConfig);
  }
}

export type InferRType<T> = T extends Executable<infer R> ? R : never;
