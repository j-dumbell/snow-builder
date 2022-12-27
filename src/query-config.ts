import { Aliased } from './builders/from-builder';

export type JoinType = 'inner' | 'left' | 'right';

export type JoinConfig = {
  joinType: JoinType;
  table: string;
  alias: string;
  leftField: string;
  rightField: string;
};

export type QueryConfig = {
  select: (string | Aliased<unknown, string>)[];
  from: string;
  fromAlias: string;
  joins?: JoinConfig[];
  where?: string;
  groupBy?: string[];
  having?: string;
  limit?: number;
};
