import { Connection } from 'snowflake-sdk';
import { selectCompile } from '../select-compile';
import { QueryConfig } from '../query-config';
import { findMany, findOne, streamRows } from '../sf-promise';
import { Table } from '../util-types';
import { Readable } from 'stream';

/** A SELECT query that is ready to be compiled & executed */
export class Executable<RType extends Table> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  /** Execute the query, returning the first row of the result,
   * or undefined if no rows are found.
  */
  findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, selectCompile(this.queryConfig));
  }

  /** Execute the query, returning the result rows as an array */
  findMany(): Promise<RType[]> {
    return findMany<RType>(this.sf, selectCompile(this.queryConfig));
  }

  /** Execute the query, and return a readable stream for streaming result rows */
  streamRows(): Readable {
    return streamRows(this.sf, selectCompile(this.queryConfig));
  }

  /** Compile and return the query */
  compile(): string {
    return selectCompile(this.queryConfig);
  }
}

/** Returns the provided executable query's result row type */
export type InferRType<T> = T extends Executable<infer R> ? R : never;
