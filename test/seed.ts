import { Connection, createConnection } from 'snowflake-sdk';
import { connect, execute } from '../src/sf-promise';
import { getEnvOrThrow } from '../src/utils';

export const dbName = 'test_db';
export const schemaName = 'test_schema';
export const roleName = 'it_role';
const userName = 'it_user';
export const whName = 'wh';
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

const usersDDL = `
CREATE OR REPLACE TABLE ${dbSchemaRef}.users (
  user_id INTEGER NOT NULL,
  email VARCHAR NOT NULL,
  is_verified BOOLEAN NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR
);
`;

const ordersDDL = `
CREATE OR REPLACE TABLE ${dbSchemaRef}.orders (
  order_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_date DATE NOT NULL,
  total DECIMAL(38, 2) NOT NULL
);
`;

const orderItemsDDL = `
CREATE OR REPLACE TABLE ${dbSchemaRef}.order_items (
  order_id INTEGER,
  sku VARCHAR,
  quantity INTEGER,
  line_total DECIMAL(38, 2)
);
`;

const usersInsert = `
INSERT INTO ${dbSchemaRef}.users VALUES 
  (1, 'jrogers@gmail.com', true, 'James', 'Rogers'),
  (2, 'bmurray@gmail.com', false, 'Bill', 'Murray');
`;

const ordersInsert = `
INSERT INTO ${dbSchemaRef}.orders VALUES 
  (1, 1, '2022-12-10', 19.50),
  (2, 1, '2022-11-30', 5.16);
`;

const orderItemsInsert = `
INSERT INTO ${dbSchemaRef}.order_items VALUES 
  (1, 'microwave', 1, 19.50),
  (2, 'batteries', 1, 2),
  (2, 'paper', 1, 3.16);
`;

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
  await connect(conn);
  await Promise.all(
    [usersDDL, ordersDDL, orderItemsDDL].map((sql) => execute(conn, sql)),
  );
  await Promise.all(
    [usersInsert, ordersInsert, orderItemsInsert].map((sql) =>
      execute(conn, sql),
    ),
  );
};
