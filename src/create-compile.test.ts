import { createCompile } from './create-compile';
import { sqlFormat } from './select-compile';
import { TConfig } from './util-types';

describe('createCompile', () => {
  it('should produce the correct DDL', () => {
    const tConfig: TConfig = {
      tRef: { db: 'foo', schema: 'bar', table: 'blah' },
      tSchema: {
        string_col: { _tag: 'varchar', length: 10, nullable: true },
        col_num: { _tag: 'number', precision: 15, scale: 10, nullable: false },
        booly: { _tag: 'boolean', nullable: true },
        date_col: { _tag: 'date', nullable: false },
        datetime_col: { _tag: 'timestamp', tz: 'LTZ', nullable: true },
        timey: { _tag: 'time', nullable: false },
      },
    };
    const actual = createCompile(tConfig, true);
    const expected = `
        CREATE OR REPLACE TABLE foo.bar.blah (
            string_col VARCHAR(10),
            col_num NUMBER(15,10) NOT NULL,
            booly BOOLEAN,
            date_col DATE NOT NULL,
            datetime_col TIMESTAMP_LTZ,
            timey TIME NOT NULL
        );
    `;
    expect(actual).toEqual(sqlFormat(expected));
  });
});
