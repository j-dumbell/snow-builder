export const getEnvOrThrow = (envName: string): string => {
  const envValue = process.env[envName];
  if (!envValue) {
    throw new Error(`environment variable ${envName} not set`);
  }
  return envValue;
};
