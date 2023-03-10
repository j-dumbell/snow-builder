import { OnlyNumber, OnlyString, SFType, Table } from './util-types';
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

export const s = <FType extends SFType>(sql: string): Expr<FType> =>
  new Expr(sql);

export type Condition = {
  expr1: string | Expr<SFType>;
  op: ComparisonOp;
  expr2: SFType | string[] | number[] | Date[] | boolean[] | Expr<SFType>;
};

export const selectFns = <Fields extends Table>() => ({
  s: <Field extends keyof Fields & string>(field: Field) =>
    new Expr<Fields[Field]>(field),
  length: length as typeof length<Fields>,
  sum: sum as typeof sum<Fields>,
  count: count as typeof count<Fields>,
  min: min as typeof min<Fields>,
  toDate: toDate as typeof toDate<Fields>,
});

export const whereFns = <Fields extends Table>() => {
  function c<FName extends keyof Fields & string, Op extends ComparisonOp>(
    expr1: FName,
    op: Op,
    expr2: Op extends 'in' | 'not in'
      ? Fields[FName][]
      : Expr<Fields[FName]> | Fields[FName],
  ): Condition;
  function c<T extends SFType, Op extends ComparisonOp>(
    expr1: Expr<T>,
    op: Op,
    expr2: Op extends 'in' ? T[] : Expr<T>,
  ): Condition;
  function c(
    expr1: string | Expr<SFType>,
    op: ComparisonOp,
    expr2: unknown,
  ): Condition {
    return {
      expr1,
      op,
      expr2: expr2 as
        | SFType
        | Expr<SFType>
        | string[]
        | number[]
        | boolean[]
        | Date[],
    };
  }

  return {
    len: length as typeof length<Fields>,
    c,
  };
};

export const orderByFns = <Fields extends Table>() => ({
  len: length as typeof length<Fields>,
  s: <Field extends keyof Fields & string>(field: Field) =>
    new Expr<Fields[Field]>(field),
});

export type SelectFns<Fields extends Table> = ReturnType<
  typeof selectFns<Fields>
>;
export type WhereFns<Fields extends Table> = ReturnType<
  typeof whereFns<Fields>
>;
export type OrderByFns<Fields extends Table> = ReturnType<
  typeof orderByFns<Fields>
>;
