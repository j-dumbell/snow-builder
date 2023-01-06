import { Connection, SnowflakeError, Statement } from 'snowflake-sdk';
import { Readable } from 'stream';

export const connect = (conn: Connection): Promise<void> =>
  new Promise((resolve, reject) =>
    conn.connect((err: SnowflakeError | undefined) =>
      err ? reject(err) : resolve(),
    ),
  );

export const execute = <T = unknown>(
  conn: Connection,
  sqlText: string,
): Promise<T[] | undefined> =>
  new Promise((resolve, reject) => {
    const complete = (
      err: SnowflakeError | undefined,
      stmt: Statement,
      rows: unknown[] | undefined,
    ) => (err ? reject(err) : resolve(rows as T[] | undefined));

    conn.execute({ sqlText, complete });
  });

export const findMany = <T = unknown>(
  conn: Connection,
  sqlText: string,
): Promise<T[]> => execute(conn, sqlText) as Promise<T[]>;

export const findOne = async <T = unknown>(
  conn: Connection,
  sqlText: string,
): Promise<T | undefined> => {
  const result = await execute<T>(conn, sqlText);
  return result && result[0];
};

export const streamRows = (conn: Connection, sqlText: string): Readable =>
  conn.execute({ sqlText, streamResult: true }).streamRows();

export const destroy = (conn: Connection): Promise<void> =>
  new Promise((resolve, reject) =>
    conn.destroy((err: SnowflakeError | undefined) =>
      err ? reject(err) : resolve(),
    ),
  );
