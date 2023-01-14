type TimePrecision = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export abstract class SType<T, IsNullable extends boolean> {
  _tag?: T;
  constructor(public isNullable: IsNullable) {}

  abstract notNull(): SType<T, false>;

  abstract ddl(): string;

  appendNullSql(fieldSql: string): string {
    return this.isNullable ? fieldSql : `${fieldSql} NOT NULL`;
  }
}


class SVarchar<T extends string = string, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable, public length?: number) {
    super(isNullable);
  }

  notNull(): SVarchar<T, false> {
    return new SVarchar(false, this.length);
  }

  ddl(): string {
    const lengthSql = this.length ? `(${this.length})` : '';
    return this.appendNullSql(`VARCHAR${lengthSql}`);
  }
}

export const sVarchar = <T extends string = string>(length?: number): SVarchar<T, true> =>
  new SVarchar<T, true>(true, length);

class SNumber<T extends number = number, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable, public precision: number, public scale: number) {
    super(isNullable);
  }

  notNull(): SNumber<T, false> {
    return new SNumber(false, this.precision, this.scale)
  }

  ddl(): string {
    return this.appendNullSql(`NUMBER(${this.precision},${this.scale})`);
  }
}

export const sNumber = <T extends number = number>(precision: number, scale: number): SNumber<T, true> =>
  new SNumber<T, true>(true, precision, scale);


class SBoolean<T extends boolean = boolean, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable) {
    super(isNullable);
  }

  notNull(): SBoolean<T, false> {
    return new SBoolean(false)
  }

  ddl(): string {
    return this.appendNullSql('BOOLEAN');
  }
}

export const sBoolean = <T extends boolean = boolean>(): SBoolean<T, true> =>
  new SBoolean<T, true>(true);


class SDate<T extends Date = Date, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable) {
    super(isNullable);
  }

  notNull(): SDate<T, false> {
    return new SDate(false)
  }

  ddl(): string {
    return this.appendNullSql('DATE');
  }
}

export const sDate = <T extends Date = Date>(): SDate<T, true> =>
  new SDate<T, true>(true);


class STimestamp<T extends Date = Date, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable, public tz?: 'ltz' | 'ntz' | 'tz') {
    super(isNullable);
  }

  notNull(): STimestamp<T, false> {
    return new STimestamp(false, this.tz)
  }

  ddl(): string {
    const tzSql = this.tz ? `_${this.tz}` : '';
    return this.appendNullSql(`TIMESTAMP${tzSql}`);
  }
}

export const sTimestamp = <T extends Date = Date>(tz?: 'ltz' | 'ntz' | 'tz'): STimestamp<T, true> =>
  new STimestamp<T, true>(true, tz)


class STime<T extends string = string, IsNullable extends boolean = true> extends SType<T, IsNullable> {
  constructor(isNullable: IsNullable, public precision?: TimePrecision) {
    super(isNullable);
  }

  notNull(): STime<T, false> {
    return new STime(false, this.precision)
  }

  ddl(): string {
    const precisionSql = this.precision ? `(${this.precision})` : '';
    return this.appendNullSql(`TIME${precisionSql}`);
  }
}

export const sTime = <T extends string = string>(precision?: TimePrecision): STime<T, true> =>
  new STime<T, true>(true, precision);


type InferT<T> = T extends SType<infer R, boolean>
  ? R
  : never;

export type STypeToTS<T extends SType<unknown, boolean>> = T['isNullable'] extends true ? InferT<T> | null : InferT<T>;
