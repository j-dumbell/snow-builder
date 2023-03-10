import { getEnvOrThrow } from './utils';

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
    });
  });
});
