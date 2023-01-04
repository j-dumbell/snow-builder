import { Aliased, Ordered } from './builders/from-builder';
import { Condition } from './sf-functions';
import { ValidFirstCharAlias } from './util-types';

export type JoinType = 'inner' | 'left' | 'right';

export type JoinConfig = {
  joinType: JoinType;
  table: string;
  alias: string;
  leftField: string;
  rightField: string;
};

export type QueryConfig = {
  select: (string | Aliased<unknown, ValidFirstCharAlias>)[];
  from: string;
  fromAlias: string;
  joins?: JoinConfig[];
  where?: string | Condition;
  groupBy?: string[];
  having?: string;
  orderBy?: Ordered[];
  limit?: number;
};
