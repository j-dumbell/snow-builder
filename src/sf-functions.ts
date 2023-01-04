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

export const s = <FType = unknown>(sql: string): Expr<FType> => new Expr(sql);

export type Condition = {
  expr1: string | Expr<unknown>;
  op: ComparisonOp;
  expr2: unknown;
};

export const selectFns = <Fields>() => ({
  s: <Field extends keyof Fields & string>(field: Field) =>
    new Expr<Fields[Field]>(field),
  length: length as typeof length<Fields>,
  sum: sum as typeof sum<Fields>,
  count: count as typeof count<Fields>,
  min: min as typeof min<Fields>,
  toDate: toDate as typeof toDate<Fields>,
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

export const orderByFns = <Fields>() => ({
  len: length as typeof length<Fields>,
  s: <Field extends keyof Fields & string>(field: Field) =>
    new Expr<Fields[Field]>(field),
});

export type SelectFns<Fields> = ReturnType<typeof selectFns<Fields>>;
export type WhereFns<Fields> = ReturnType<typeof whereFns<Fields>>;
export type OrderByFns<Fields> = ReturnType<typeof orderByFns<Fields>>;
