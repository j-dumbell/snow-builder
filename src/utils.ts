export const getEnvOrThrow = (envName: string): string => {
  const envValue = process.env[envName];
  if (!envValue) {
    throw new Error(`environment variable ${envName} not set`);
  }
  return envValue;
};

export const orderObjectByKeys = <T>(
  o: Record<string, T>,
  descending = false,
): [string, T][] => {
  const sortFn = descending
    ? ([aName]: [string, T], [bName]: [string, T]) => (aName > bName ? -1 : 1)
    : ([aName]: [string, T], [bName]: [string, T]) => (aName < bName ? -1 : 1);
  return Object.entries(o).sort(sortFn);
};
