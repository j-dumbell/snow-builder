import {getEnvOrThrow, orderObjectByKeys} from './utils';

describe('utils', () => {
    describe('getEnvOrThrow', () => {
        let initialProcess: NodeJS.ProcessEnv;

        beforeAll(() => {
            initialProcess = process.env;
        });

        afterAll(() => {
            process.env = initialProcess;    
        });

        it('should retrieve the env variable when it exists', () => {
            const varName = 'TEST_VAR';
            const varValue = 'blah';
            process.env[varName] = varValue;
            expect(getEnvOrThrow(varName)).toEqual(varValue);
        });

        it('should throw when the env variable does not exist', () => {
            expect(() => getEnvOrThrow('UNKNOWN_ENV_VAR')).toThrow();
        })
    })

    describe('orderObjectByKeys', () => {
        const obj = {a: 1, b: 2};

        it('should order ascending when specified', () => {
            const actual = orderObjectByKeys(obj, false);
            const expected = [['a', 1], ['b', 2]];
            expect(actual).toEqual(expected);
        });

        it('should order descending when specified', () => {
            const actual = orderObjectByKeys(obj, true);
            const expected = [['b', 2], ['a', 1]];
            expect(actual).toEqual(expected);
        });
    })
})