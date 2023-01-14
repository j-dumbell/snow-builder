type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type ZeroToThirtyEight =
  | ZeroToNine
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38;

type TZ = 'LTZ' | 'NTZ' | 'TZ';

type SFVarchar<T extends string = string, Nullable extends boolean = true> = {
  _tag: 'varchar';
  _type?: T;
  length?: number;
  nullable: Nullable;
};

type SFNumber<T extends number = number, Nullable extends boolean = true> = {
  _tag: 'number';
  _type?: T;
  precision: ZeroToThirtyEight;
  scale: ZeroToThirtyEight;
  nullable: Nullable;
};

type SFBoolean<T extends boolean = boolean, Nullable extends boolean = true> = {
  _tag: 'boolean';
  _type?: T;
  nullable: Nullable;
};

type SFDate<Nullable extends boolean = true> = {
  _tag: 'date';
  _type?: Date;
  nullable: Nullable;
};

type SFTimestamp<Nullable extends boolean = true> = {
  _tag: 'timestamp';
  _type?: Date;
  tz?: TZ;
  nullable: Nullable;
};

type SFTime<Nullable extends boolean = true> = {
  _tag: 'time';
  _type?: string;
  precision?: ZeroToNine;
  nullable: Nullable;
};

export type FConfig =
  | SFVarchar<string, boolean>
  | SFNumber<number, boolean>
  | SFBoolean<boolean, boolean>
  | SFDate<boolean>
  | SFTimestamp<boolean>;

export type FConfigToTS<T extends FConfig> = T['nullable'] extends true
  ? NonNullable<T['_type']> | null
  : NonNullable<T['_type']>;

export const sVarchar = <T extends string = string>(
  length?: number,
): SFVarchar<T, true> & { notNull: () => SFVarchar<T, false> } => ({
  _tag: 'varchar',
  length: length,
  nullable: true,
  notNull: () => ({
    _tag: 'varchar',
    length: length,
    nullable: false,
  }),
});

export const sNumber = <T extends number = number>(
  precision: ZeroToThirtyEight,
  scale: ZeroToThirtyEight,
): SFNumber<T, true> & { notNull: () => SFNumber<T, false> } => ({
  _tag: 'number',
  precision,
  scale,
  nullable: true,
  notNull: () => ({
    _tag: 'number',
    precision,
    scale,
    nullable: false,
  }),
});

export const sBoolean = <T extends boolean = boolean>(): SFBoolean<T, true> & {
  notNull: () => SFBoolean<T, false>;
} => ({
  _tag: 'boolean',
  nullable: true,
  notNull: () => ({
    _tag: 'boolean',
    nullable: false,
  }),
});

export const sDate = (): SFDate<true> & { notNull: () => SFDate<false> } => ({
  _tag: 'date',
  nullable: true,
  notNull: () => ({
    _tag: 'date',
    nullable: false,
  }),
});

export const sTimestamp = (
  tz?: TZ,
): SFTimestamp<true> & {
  notNull: () => SFTimestamp<false>;
} => ({
  _tag: 'timestamp',
  tz,
  nullable: true,
  notNull: () => ({
    _tag: 'timestamp',
    tz,
    nullable: false,
  }),
});

export const sTime = (
  precision?: ZeroToNine,
): SFTime<true> & {
  notNull: () => SFTime<false>;
} => ({
  _tag: 'time',
  precision,
  nullable: true,
  notNull: () => ({
    _tag: 'time',
    precision,
    nullable: false,
  }),
});
