type TimePrecision = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export abstract class SType<T> {
  private _tag?: T;
  isNullable = true;

  notNull(): this {
    this.isNullable = false;
    return this;
  }

  abstract ddl(): string;
}


export class SVarchar<T extends string = string> extends SType<T> {
  constructor(private length?: number) {
    super();
  }

  ddl(): string {
    const lengthSql = length ? `(${this.length})` : '';
    return `VARCHAR${lengthSql}`;
  }
}

export class SNumber<T extends number = number> extends SType<T> {
  constructor(private precision: number, private scale: number) {
    super();
  }

  ddl(): string {
    return `NUMBER(${this.precision},${this.scale})`;
  }
}


export class SBoolean<T extends boolean = boolean> extends SType<T> {
  constructor() {
    super();
  }

  ddl(): string {
    return 'BOOLEAN';
  }
}


export class SDate<T extends Date = Date> extends SType<T> {
  constructor() {
    super();
  }

  ddl(): string {
    return 'DATE';
  }
}


export class STimestamp<T extends Date = Date> extends SType<T> {
  constructor(private tz?: 'ltz' | 'ntz' | 'tz') {
    super();
  }

  ddl(): string {
    const tzSql = this.tz ? `_${this.tz}` : '';
    return `TIMESTAMP${tzSql}`;
  }
}


export class STime extends SType<string> {
  constructor(private precision?: TimePrecision) {
    super();
  }

  ddl(): string {
    const precisionSql = this.precision ? `(${this.precision})` : '';
    return `TIME${precisionSql}`;
  }
}

export type STypeToTS<T extends SType<unknown>> = T extends SType<infer R>
  ? R
  : never;
