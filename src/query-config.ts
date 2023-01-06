import { Executable } from './builders/executable';
import { Aliased, Ordered } from './builders/from-builder';
import { Condition } from './sf-functions';
import { SFType, Table, ValidFirstCharAlias } from './util-types';

export type JoinType = 'inner' | 'left' | 'right';

export type JoinConfig = {
  joinType: JoinType;
  table: string | Executable<Table>;
  alias: string;
  leftField: string;
  rightField: string;
};

export type QueryConfig = {
  select: (string | Aliased<SFType, ValidFirstCharAlias>)[];
  from: string | Executable<Table>;
  fromAlias: string;
  joins?: JoinConfig[];
  where?: string | Condition;
  groupBy?: string[];
  having?: string;
  orderBy?: Ordered[];
  limit?: number;
};
