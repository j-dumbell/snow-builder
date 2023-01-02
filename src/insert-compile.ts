import { orderObjectByKeys } from './utils';

export type SFType = string | number | boolean | Date;

const sfTypeToSql = (value: SFType): string => {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return `'${value.toISOString()}'`;
}

export const recordToSql = (record: Record<string, SFType>): string => {
  const ordered = orderObjectByKeys(record, false)
    .map(([,value]) => sfTypeToSql(value))
    .join(',');
  return `(${ordered})`
};
