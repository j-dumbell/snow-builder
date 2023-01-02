import {
  Connection,
  createConnection,
  SnowflakeError,
  Statement,
  Binds,
} from 'snowflake-sdk';
import { connect, execute, findOne, destroy } from './sf-promise';

describe('sf-promise', () => {
  const conn: Connection = createConnection({
    account: '',
    username: '',
    password: '',
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should reject with error when error passed to callback', async () => {
      const spy = jest
        .spyOn(conn, 'connect')
        .mockImplementation(
          (fn: (err: SnowflakeError | undefined, conn: Connection) => void) =>
            fn(new Error('failed to connect'), conn),
        );

      await expect(connect(conn)).rejects.toThrow('failed to connect');
      expect(spy.mock.calls.length).toEqual(1);
    });

    it('should resolve when no error passed to callback', async () => {
      const spy = jest
        .spyOn(conn, 'connect')
        .mockImplementation(
          (fn: (err: SnowflakeError | undefined, conn: Connection) => void) =>
            fn(undefined, conn),
        );

      await expect(connect(conn)).resolves;
      expect(spy.mock.calls.length).toEqual(1);
    });
  });

  describe('execute', () => {
    it('should reject with error when error passed to callback', async () => {
      const spy = jest
        .spyOn(conn, 'execute')
        .mockImplementation(
          (props: {
            sqlText: string;
            streamResult?: boolean | undefined;
            binds?: Binds | undefined;
            fetchAsString?:
              | ('String' | 'Boolean' | 'Number' | 'Date' | 'JSON' | 'Buffer')[]
              | undefined;
            complete?:
              | ((
                  err: SnowflakeError | undefined,
                  stmt: Statement,
                  rows: any[] | undefined,
                ) => void)
              | undefined;
          }) => {
            props.complete &&
              props.complete(
                new Error('sql error'),
                {} as Statement,
                undefined,
              );
            return {} as Statement;
          },
        );

      await expect(execute(conn, 'SELECT * FROM users;')).rejects.toThrow(
        'sql error',
      );
      expect(spy.mock.calls.length).toEqual(1);
    });

    it('should resolve with rows when no error passed to callback', async () => {
      const rows = [{ a: 1 }, { a: 2 }];
      const sql = 'SELECT * FROM users;';
      const spy = mockExecuteReturnRows(conn, rows);

      await expect(execute(conn, sql)).resolves.toEqual(rows);
      expect(spy.mock.calls.length).toEqual(1);
      expect(spy.mock.calls[0][0]['sqlText']).toEqual(sql);
    });
  });

  describe('findOne', () => {
    it('should return the first row only', async () => {
      const rows = [{ a: 1 }, { a: 2 }];
      const sql = 'SELECT * FROM orders;';
      const spy = mockExecuteReturnRows(conn, rows);

      const actual = await findOne(conn, sql);
      expect(actual).toEqual(rows[0]);
      expect(spy.mock.calls.length).toEqual(1);
      expect(spy.mock.calls[0][0]['sqlText']).toEqual(sql);
    });
  });

  describe('destroy', () => {
    it('should reject when error passed to the callback', async () => {
      const spy = jest
        .spyOn(conn, 'destroy')
        .mockImplementation(
          (cb: (err: SnowflakeError | undefined, conn: Connection) => void) => {
            cb(new Error('destroy error'), conn);
            return;
          },
        );

      await expect(destroy(conn)).rejects.toThrow('destroy error');
      expect(spy.mock.calls.length).toEqual(1);
    });

    it('should resolve when no error passed to the callback', async () => {
      const spy = jest
        .spyOn(conn, 'destroy')
        .mockImplementation(
          (cb: (err: SnowflakeError | undefined, conn: Connection) => void) => {
            cb(undefined, conn);
            return;
          },
        );

      await expect(destroy(conn)).resolves;
      expect(spy.mock.calls.length).toEqual(1);
    });
  });
});

const mockExecuteReturnRows = (
  conn: Connection,
  rows: unknown[] | undefined,
): jest.SpyInstance =>
  jest
    .spyOn(conn, 'execute')
    .mockImplementation(
      (props: {
        sqlText: string;
        streamResult?: boolean | undefined;
        binds?: Binds | undefined;
        fetchAsString?:
          | ('String' | 'Boolean' | 'Number' | 'Date' | 'JSON' | 'Buffer')[]
          | undefined;
        complete?:
          | ((
              err: SnowflakeError | undefined,
              stmt: Statement,
              rows: any[] | undefined,
            ) => void)
          | undefined;
      }) => {
        props.complete && props.complete(undefined, {} as Statement, rows);
        return {} as Statement;
      },
    );
