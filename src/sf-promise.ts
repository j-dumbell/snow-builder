import { Connection, SnowflakeError, Statement } from 'snowflake-sdk';

export const connect = (conn: Connection): Promise<void> =>
  new Promise((resolve, reject) => {
    conn.connect((err: SnowflakeError | undefined, conn: Connection) =>
      err ? resolve() : reject(err),
    );
  });

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

export const connectAndExecute = async <T>(
  conn: Connection,
  sqlText: string,
): Promise<T[] | undefined> => {
  await connect(conn);
  return execute(conn, sqlText);
};

export const findOne = async <T>(
  conn: Connection,
  sqlText: string,
): Promise<T | undefined> => {
  const result = await connectAndExecute<T>(conn, sqlText);
  return result && result[0];
};
