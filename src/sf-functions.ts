import { KeysMatchingType, OnlyNumber, OnlyString } from './util-types';
import { Expr } from './builders/from-builder';
import { ComparisonOp } from './builders/select-builder';

const sum = <T>(
  field: OnlyNumber<T>,
  partitionBy?: (keyof T & string)[],
): Expr<number> => {
  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';
  const sql = `SUM(${field})${partitionBySql}`;

  return new Expr<number>(sql);
};

const count = <T>(
  field?: (keyof T & string) | '*',
  partitionBy?: (keyof T & string)[],
): Expr<number> => {
  const fieldSql = field || '';

  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';
  const sql = `COUNT(${fieldSql})${partitionBySql}`;

  return new Expr<number>(sql);
};

const min = <T>(
  field: keyof T & string,
  partitionBy?: (keyof T & string)[],
  orderBy?: (keyof T & string)[],
): Expr<number> => {
  const partitionBySql = partitionBy
    ? ` PARTITION BY ${partitionBy.join(',')}`
    : '';

  const orderBySql = orderBy ? ` ORDER BY ${orderBy.join(',')}` : '';

  const sql = `COUNT(${field})${partitionBySql}${orderBySql}`;

  return new Expr<number>(sql);
};

const toDate = <T>(field: OnlyString<T>): Expr<Date> =>
  new Expr<Date>(`to_date(${field})`);

const length = <T>(field: OnlyString<T>): Expr<number> =>
  new Expr<number>(`LENGTH(${field})`);

export const s = (sql: string): Expr<unknown> => new Expr(sql);

export type Condition = {
  expr1: string | Expr<unknown>;
  op: ComparisonOp;
  expr2: unknown;
};

type Condition1<Fields, FName extends keyof Fields & string> = {
  expr1: FName | Expr<Fields[FName]>;
  op: ComparisonOp;
  expr2:
    | KeysMatchingType<Fields, Fields[FName]>
    | Expr<Fields[FName]>
    | Fields[FName];
};

export const selectFns = <T>() => ({
  s: <Field extends keyof T & string>(field: Field) =>
    new Expr<T[Field]>(field),
  length: length as typeof length<T>,
  sum: sum as typeof sum<T>,
  count: count as typeof count<T>,
  min: min as typeof min<T>,
  toDate: toDate as typeof toDate<T>,
});

export const whereFns = <Fields>() => {
  function c<FName extends keyof Fields & string, Op extends ComparisonOp>(
    expr1: FName,
    op: Op,
    expr2: Op extends 'in' | 'not in'
      ? Fields[FName][]
      :
          | KeysMatchingType<Fields, Fields[FName]>
          | Expr<Fields[FName]>
          | Fields[FName],
  ): Condition;
  function c<T, Op extends ComparisonOp>(
    expr1: Expr<T>,
    op: Op,
    expr2: Op extends 'in' ? T[] : Expr<T>,
  ): Condition;
  function c(
    expr1: string | Expr<unknown>,
    op: ComparisonOp,
    expr2: unknown,
  ): Condition {
    return {
      expr1,
      op,
      expr2,
    };
  }

  return {
    len: length as typeof length<Fields>,
    c,
  };
};

export type SelectFns<T> = ReturnType<typeof selectFns<T>>;
export type WhereFns<T> = ReturnType<typeof whereFns<T>>;
