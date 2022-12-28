import {
  InferColumnName,
  InferColumnType,
  OnlyBoolean,
  OnlyDate,
  OnlyNumber,
  OnlyString,
  PrefixKeys,
  Selectable,
  SelectableToObject,
  StringKeys,
  StripPrefix,
} from './util-types';
import { Equal, Expect } from '../test/utils';
import { Aliased } from './builders/from-builder';

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

type TestType3 = {
  name: string;
  'users.age': number;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('util-types', () => {
  describe('OnlyString', () => {
    it('OnlyString', () => {
      type Actual = OnlyString<TestType1>;
      type Expected = 'a' | 'b';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('OnlyNumber', () => {
    it('OnlyNumber', () => {
      type Actual = OnlyNumber<TestType1>;
      type Expected = 'c' | 'd';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('OnlyBoolean', () => {
    it('OnlyBoolean', () => {
      type Actual = OnlyBoolean<TestType1>;
      type Expected = 'e' | 'f';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('OnlyDate', () => {
    it('OnlyDate', () => {
      type Actual = OnlyDate<TestType1>;
      type Expected = 'g' | 'h';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('StringKeys', () => {
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
  });

  describe('Selectable', () => {
    it('Selectable', () => {
      type Actual = Selectable<TestType2>;
      type Expected = 'foo' | 'bar' | 'opt' | Aliased<unknown, string>;
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('StripPrefix', () => {
    it('with alias', () => {
      type Actual = StripPrefix<'users.fieldname'>;
      type Expected = 'fieldname';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });

    it('without alias', () => {
      type Actual = StripPrefix<'blah_blah'>;
      type Expected = 'blah_blah';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('InferColumnName', () => {
    it('aliased', () => {
      type Actual = InferColumnName<TestType3, Aliased<unknown, 'blah'>>;
      type Expected = 'BLAH';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });

    it('without alias', () => {
      type Actual = InferColumnName<TestType3, 'name'>;
      type Expected = 'NAME';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });

    it('with alias', () => {
      type Actual = InferColumnName<TestType3, 'users.age'>;
      type Expected = 'AGE';
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });

  describe('InferColumnType', () => {
    it('aliased', () => {
      type Actual = InferColumnType<TestType3, Aliased<Date, 'blah'>>;
      type Assertion = Expect<Equal<Actual, Date>>;
    });

    it('without alias', () => {
      type Actual = InferColumnType<TestType3, 'name'>;
      type Assertion = Expect<Equal<Actual, string>>;
    });

    it('with alias', () => {
      type Actual = InferColumnType<TestType3, 'users.age'>;
      type Assertion = Expect<Equal<Actual, number>>;
    });
  });

  describe('SelectableToObject', () => {
    it('', () => {
      const selected: [
        'name',
        'users.age',
        Aliased<Date, 'pref'>,
        Aliased<boolean, 'true_false'>,
      ] = [
        'name',
        'users.age',
        new Aliased<Date, 'pref'>('', 'pref'),
        new Aliased<boolean, 'true_false'>('', 'true_false'),
      ];
      type Actual = SelectableToObject<TestType3, typeof selected>;
      type Expected = {
        NAME: string;
        AGE: number;
        PREF: Date;
        TRUE_FALSE: boolean;
      };
      type Assertion = Expect<Equal<Actual, Expected>>;
    });
  });
});