import {
  OnlyBoolean,
  OnlyDate,
  OnlyNumber,
  OnlyString,
  PrefixKeys,
  StringKeys,
  StripPrefix,
} from './util-types';
import { Equal, Expect } from '../test/utils';

const symbol = Symbol();

type TestType1 = {
  a: string;
  b: string;
  c: number;
  d: number;
  e: boolean;
  f: boolean;
  g: Date;
  h: Date;
  [symbol]: string;
  0: number;
};

type TestType2 = {
  foo: string;
  bar: number;
  opt?: boolean;
  1: string;
  [symbol]: Date;
};

describe('util-types', () => {
  it('OnlyString', () => {
    type Actual = OnlyString<TestType1>;
    type Expected = 'a' | 'b';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('OnlyNumber', () => {
    type Actual = OnlyNumber<TestType1>;
    type Expected = 'c' | 'd';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('OnlyBoolean', () => {
    type Actual = OnlyBoolean<TestType1>;
    type Expected = 'e' | 'f';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('OnlyDate', () => {
    type Actual = OnlyDate<TestType1>;
    type Expected = 'g' | 'h';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('StringKeys', () => {
    type Actual = StringKeys<TestType1>;
    type Expected = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('StringKeys', () => {
    type Actual = PrefixKeys<TestType2, 'prefix'>;
    type Expected = {
      'prefix.foo': string;
      'prefix.bar': number;
      'prefix.opt'?: boolean;
    };
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('StripPrefix 1', () => {
    type Actual = StripPrefix<'users.fieldname'>;
    type Expected = 'fieldname';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });

  it('StripPrefix 2', () => {
    type Actual = StripPrefix<'blah_blah'>;
    type Expected = 'blah_blah';
    type Assertion = Expect<Equal<Actual, Expected>>;
  });
});
