import { Aliased } from './builders/from-builder';

type Varchar = { _type: 'varchar'; length?: number };
type SFNumber = { _type: 'number'; precision: number; scale: number };
type SFBoolean = { _type: 'boolean' };
type SFDate = { _type: 'date' };
type Timestamp = { _type: 'timestamp' };

export type SType = Varchar | SFNumber | SFBoolean | SFDate | Timestamp;

export type TConfig = Record<string, SType & { nullable: boolean }>;

export type DBConfig = Record<string, TConfig>;

type STypeToTS<T extends SType> = T extends Varchar
  ? string
  : T extends SFNumber
  ? number
  : T extends SFBoolean
  ? boolean
  : Date;

export type TableFromConfig<T extends TConfig> = {
  [FName in keyof T]: T[FName]['nullable'] extends true
    ? STypeToTS<T[FName]> | null
    : STypeToTS<T[FName]>;
};

export type SFType = string | number | boolean | Date | null;

export type Table = Record<string, SFType>;

export type KeysMatchingType<T, R> = keyof {
  [K in keyof T as T[K] extends R ? K : never]: T[K];
} &
  string;

export type UpperCaseObjKey<T> = {
  [K in keyof T as K extends string ? Uppercase<K> : never]: T[K];
};

export type OnlyString<T> = KeysMatchingType<T, string | null>;
export type OnlyNumber<T> = KeysMatchingType<T, number | null>;
export type OnlyBoolean<T> = KeysMatchingType<T, boolean | null>;
export type OnlyDate<T> = KeysMatchingType<T, Date | null>;

export type StringKeys<T> = keyof T & string;

export type PrefixKeys<T, S extends string> = {
  [K in keyof T as `${S}.${string & K}`]: T[K];
};

export type Selectable<T> =
  | StringKeys<T>
  | Aliased<SFType, ValidFirstCharAlias>;

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
  : T extends Aliased<SFType, infer R>
  ? Uppercase<R>
  : never;

export type SelectableToObject<
  Fields extends Table,
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
