import { Connection, createConnection } from 'snowflake-sdk';
import { Db } from '../src/db';
import { connect, execute } from '../src/sf-promise';
import { getEnvOrThrow } from '../src/utils';
import { dbName, roleName, schemaName, userName, whName } from './config';
import {
  dbConfig,
  orderItemsRecords,
  ordersRecords,
  usersRecords,
} from './fixtures';

const dbSchemaRef = `${dbName}.${schemaName}`;

const createUser = (username: string, password: string) => `
CREATE OR REPLACE USER ${userName}
  LOGIN_NAME = ${username}
  PASSWORD = '${password}';
`;
const createRole = `CREATE OR REPLACE ROLE ${roleName};`;
const createWH = `
CREATE OR REPLACE WAREHOUSE ${whName} WITH
  WAREHOUSE_SIZE = XSMALL
  AUTO_SUSPEND = 60
  INITIALLY_SUSPENDED = TRUE;
`;
const createDb = `CREATE OR REPLACE DATABASE ${dbName};`;
const createSchema = `CREATE OR REPLACE SCHEMA ${dbName}.${schemaName};`;

const grantWH = `GRANT USAGE ON WAREHOUSE ${whName} TO ROLE ${roleName};`;
const grantDb = `GRANT USAGE ON DATABASE ${dbName} TO ROLE ${roleName};`;
const grantSchema = `GRANT ALL PRIVILEGES ON SCHEMA ${dbSchemaRef} TO ROLE ${roleName};`;
const grantTables = `GRANT SELECT,INSERT,DELETE ON FUTURE TABLES IN SCHEMA ${dbSchemaRef} TO ROLE ${roleName};`;
const grantRole = `GRANT ROLE ${roleName} TO USER ${userName}`;

export const bootstrap = async (): Promise<void> => {
  const conn = createConnection({
    account: getEnvOrThrow('ACCOUNT'),
    username: getEnvOrThrow('ADMIN_USERNAME'),
    role: 'ACCOUNTADMIN',
    password: getEnvOrThrow('ADMIN_PASSWORD'),
  });

  await connect(conn);
  const statements: string[] = [
    createUser(getEnvOrThrow('IT_USERNAME'), getEnvOrThrow('IT_PASSWORD')),
    createRole,
    createWH,
    createDb,
    createSchema,
    grantWH,
    grantDb,
    grantSchema,
    grantTables,
    grantRole,
  ];
  for (const sql of statements) {
    await execute(conn, sql);
  }
};

export const seed = async (conn: Connection): Promise<void> => {
  const db = new Db(conn, dbConfig);
  await connect(conn);
  await db.createAllTables(true);
  await db.insertInto('users', usersRecords);
  await db.insertInto('orders', ordersRecords);
  await db.insertInto('order_items', orderItemsRecords);
};
