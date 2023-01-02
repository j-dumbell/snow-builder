import { Aliased } from './builders/from-builder';

export type KeysMatchingType<T, R> = keyof {
  [K in keyof T as T[K] extends R ? K : never]: T[K];
} &
  string;

export type UpperCaseObjKey<T> = {
  [K in keyof T as K extends string ? Uppercase<K> : never]: T[K]
};

export type OnlyString<T> = KeysMatchingType<T, string>;
export type OnlyNumber<T> = KeysMatchingType<T, number>;
export type OnlyBoolean<T> = KeysMatchingType<T, boolean>;
export type OnlyDate<T> = KeysMatchingType<T, Date>;

export type StringKeys<T> = keyof T & string;

export type PrefixKeys<T, S extends string> = {
  [K in keyof T as `${S}.${string & K}`]: T[K];
};

export type Selectable<T> =
  | StringKeys<T>
  | Aliased<unknown, ValidFirstCharAlias>;

export type InferColumnType<
  Fields,
  T extends Selectable<Fields>,
> = T extends StringKeys<Fields>
  ? Fields[T]
  : T extends Aliased<infer R, ValidFirstCharAlias>
  ? R
  : never;

export type StripPrefix<T extends string> = T extends `${string}.${infer R}`
  ? R
  : T;

export type InferColumnName<
  Fields,
  T extends Selectable<Fields>,
> = T extends StringKeys<Fields>
  ? Uppercase<StripPrefix<T>>
  : T extends Aliased<unknown, infer R>
  ? Uppercase<R>
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

type InvalidCharacter =
  | '!'
  | '@'
  | '£'
  | '%'
  | '^'
  | '&'
  | '*'
  | '('
  | ')'
  | '-'
  | '+'
  | '='
  | '{'
  | '['
  | '}'
  | ']'
  | ';'
  | ':'
  | '"'
  | "'"
  | '|'
  | '<'
  | '.'
  | '>'
  | '?'
  | '/';

type Letters =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

export type ValidFirstChar = Letters | Uppercase<Letters> | '_';

export type ValidFirstCharAlias = `${ValidFirstChar}${string}`;

export type IsValidAlias<
  S extends ValidFirstCharAlias,
  IfTrue = true,
  IfFalse = false,
> = S extends `${string}${InvalidCharacter}${string}` ? IfFalse : IfTrue;
