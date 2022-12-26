import { bootstrap } from './seed';
import * as dotenv from 'dotenv';

dotenv.config();

bootstrap()
  .then(() => console.info('successfully bootstrapped Snowflake'))
  .catch(console.error);
