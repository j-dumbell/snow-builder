import { Connection, SnowflakeError, Statement } from 'snowflake-sdk';

export const connect = (conn: Connection): Promise<void> =>
  new Promise((resolve, reject) =>
    conn.connect((err: SnowflakeError | undefined) =>
      err ? reject(err) : resolve(),
    ),
  );

export const execute = <T>(
  conn: Connection,
  sqlText: string,
): Promise<T[] | undefined> =>
  new Promise((resolve, reject) => {
    const complete = (
      err: SnowflakeError | undefined,
      stmt: Statement,
      rows: any[] | undefined,
    ) => (err ? reject(err) : resolve(rows as T[] | undefined));

    conn.execute({ sqlText, complete });
  });

export const findOne = async <T>(
  conn: Connection,
  sqlText: string,
): Promise<T | undefined> => {
  const result = await execute<T>(conn, sqlText);
  return result && result[0];
};

export const destroy = (conn: Connection): Promise<void> =>
  new Promise((resolve, reject) =>
    conn.destroy((err: SnowflakeError | undefined) =>
      err ? reject(err) : resolve(),
    ),
  );