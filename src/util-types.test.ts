import {
  InferColumnName,
  InferColumnType,
  IsValidAlias,
  OnlyBoolean,
  OnlyDate,
  OnlyNumber,
  OnlyString,
  PrefixKeys,
  Selectable,
  SelectableToObject,
  StringKeys,
  StripPrefix,
  ValidFirstCharAlias,
  UpperCaseObjKey,
  SFType,
  SetNullableKeysToOptional,
} from './util-types';
import { Equal, Expect } from '../test/utils';
import { Aliased } from './builders/from-builder';
import { number } from 'ts-pattern/dist/patterns';

const symbol = Symbol();

type TestType1 = {
  a: string | null;
  b: string;
  c: number;
  d: number | null;
  e: boolean;
  f: boolean | null;
  g: Date;
  h: Date | null;
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

type TestType4 = {
  aBc: number;
  C_dE: boolean;
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
      type Expected =
        | 'foo'
        | 'bar'
        | 'opt'
        | Aliased<SFType, ValidFirstCharAlias>;
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
      type Actual = InferColumnName<TestType3, Aliased<SFType, 'blah'>>;
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

  describe('IsValidAlias', () => {
    it('invalid character in string', () => {
      type Actual = IsValidAlias<'ba!k'>;
      type Assertion = Expect<Equal<Actual, false>>;
    });

    it('only letters', () => {
      type Actual = IsValidAlias<'Abc1'>;
      type Assertion = Expect<Equal<Actual, true>>;
    });

    it('starts with underscore', () => {
      type Actual = IsValidAlias<'_1bC'>;
      type Assertion = Expect<Equal<Actual, true>>;
    });

    it('compile error when starts with a number', () => {
      // @ts-expect-error - see test name
      type Actual = IsValidAlias<'1bCe'>;
    });
  });

  describe('UpperCaseObjKey', () => {
    it('should set all object keys to upper case', () => {
      type Actual = UpperCaseObjKey<TestType4>;
      type Expected = {
        ABC: number;
        C_DE: boolean;
      };
      type Assertion = Expect<Equal<Expected, Actual>>;
    });
  });

  describe('SetNullableKeysToOptional', () => {
    type Actual = SetNullableKeysToOptional<TestType1>;
    const a: Actual = {
      b: '',
      c: 1,
      e: true,
      g: new Date(),
      0: 1,
      [symbol]: '',
    };
  })
});
