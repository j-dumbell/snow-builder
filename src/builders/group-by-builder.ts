import { compile } from '../compile';
import { QueryConfig } from '../query-config';
import { HavingBuilder } from './having-builder';
import { LimitBuilder } from './limit-builder';
import { Connection } from 'snowflake-sdk';
import { connectAndExecute, findOne } from '../sf-promise';

export class GroupByBuilder<RType> {
  constructor(public sf: Connection, public queryConfig: QueryConfig) {}

  having(raw: string): HavingBuilder {
    return new HavingBuilder({ ...this.queryConfig, having: raw });
  }

  limit(n: number): LimitBuilder {
    return new LimitBuilder({ ...this.queryConfig, limit: n });
  }

  async findOne(): Promise<RType | undefined> {
    return findOne<RType>(this.sf, compile(this.queryConfig));
  }

  findMany(): Promise<RType[] | undefined> {
    return connectAndExecute<RType>(this.sf, compile(this.queryConfig));
  }

  compile(): string {
    return compile(this.queryConfig);
  }
}
