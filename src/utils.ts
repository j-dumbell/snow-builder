import { TRef } from './util-types';

export const getEnvOrThrow = (envName: string): string => {
  const envValue = process.env[envName];
  if (!envValue) {
    throw new Error(`environment variable ${envName} not set`);
  }
  return envValue;
};

export const tRefToSql = ({ db, schema, table }: TRef): string =>
  `${db}.${schema}.${table}`;
