type KeysMatchingType<T, R> = keyof {
  [K in keyof T as T[K] extends R ? K : never]: T[K];
} &
  string;

export type OnlyString<T> = KeysMatchingType<T, string>;
export type OnlyNumber<T> = KeysMatchingType<T, number>;
export type OnlyBoolean<T> = KeysMatchingType<T, boolean>;
export type OnlyDate<T> = KeysMatchingType<T, Date>;

export type PrefixKeys<T, S extends string> = {
  [K in keyof T as `${S}.${string & K}`]: T[K];
};

export type Selectable<T> =
  | keyof T
  | `sum(${string & keyof T})`
  | 'count()'
  | `length(${OnlyString<T>})`;
