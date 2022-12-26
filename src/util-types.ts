import { Aliased } from './builders/from-builder';

type KeysMatchingType<T, R> = keyof {
  [K in keyof T as T[K] extends R ? K : never]: T[K];
} &
  string;

export type OnlyString<T> = KeysMatchingType<T, string>;
export type OnlyNumber<T> = KeysMatchingType<T, number>;
export type OnlyBoolean<T> = KeysMatchingType<T, boolean>;
export type OnlyDate<T> = KeysMatchingType<T, Date>;

export type StringKeys<T> = keyof T & string;

export type PrefixKeys<T, S extends string> = {
  [K in keyof T as `${S}.${string & K}`]: T[K];
};

export type Selectable<T> = StringKeys<T> | Aliased<unknown, string>;

type InferColumnType<
  Fields,
  T extends Selectable<Fields>,
> = T extends StringKeys<Fields>
  ? Fields[T]
  : T extends Aliased<infer R, string>
  ? R
  : never;

type StripAlias<T extends string> = T extends `${string}.${infer R}` ? R : T;

type InferColumnName<
  Fields,
  T extends Selectable<Fields>,
> = T extends StringKeys<Fields>
  ? StripAlias<T>
  : T extends Aliased<unknown, infer R>
  ? StripAlias<R>
  : never;

export type SelectableToObject<
  Fields,
  Selected extends Selectable<Fields>[],
> = {
  [K in Selected[number] as InferColumnName<Fields, K>]: InferColumnType<
    Fields,
    K
  >;
};
