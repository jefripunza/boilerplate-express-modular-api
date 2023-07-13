import * as path from 'path';
import dotenv from 'dotenv';

import { project_root } from './paths';

dotenv.config({
  path: path.join(project_root, '.env')
});

export const NODE_ENV = process.env?.NODE_ENV || 'local';
export namespace Server {
  export const SECRET_KEY = process.env?.SECRET_KEY || 'high-secret-key';

  export const isProduction = String(NODE_ENV).includes('production');
  export const isDevelopment = String(NODE_ENV).includes('development');
  export const isLocal = ![isDevelopment, isProduction].includes(true);

  export const PORT = Number(process.env.PORT || '8080');
  export const TZ = process.env?.TZ || 'Asia/Jakarta';
}

export namespace Swagger {
  export const APP_NAME = process.env.APP_NAME;
  export const APP_VERSION = process.env.APP_VERSION;
  export const APP_DESCRIPTION = process.env.APP_DESCRIPTION;
  export const APP_SCHEMES = process.env?.APP_SCHEMES
    ? String(process.env.APP_SCHEMES).toLowerCase().split('|')
    : ['http', 'https'];
  export const CONTACT_NAME = process.env.CONTACT_NAME;
  export const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
}

export namespace Database {
  export const TYPE = process.env?.DB_TYPE || 'mysql2';
  export const HOST = process.env?.DB_HOST || 'localhost';
  export const PORT = Number(process.env.DB_PORT || 3306);
  export const USER = process.env?.DB_USER || 'root';
  export const PASS = process.env?.DB_PASS || '';
  export const NAME = process.env.DB_NAME || 'test';

  export const poolMin = Number(process.env.DB_POOL_MIN || 0);
  export const poolMax = Number(process.env.DB_POOL_MAX || 10);
}

export const OTP_EXPIRED_MINUTE = Number(process.env.OTP_EXPIRED_MINUTE || 3);

export namespace Jwt {
  export const SECRET_TOKEN =
    process.env?.JWT_SECRET_TOKEN || 'very-secret-token';
  export const EXPIRED_TOKEN = process.env?.JWT_EXPIRED_TOKEN || '7d';
}

export namespace Reporter {
  export const ERROR_URL = process.env.REPORT_ERROR_URL;
  export const BUSINESS_URL = process.env.REPORT_BUSINESS_URL;
  export const BEARER_TOKEN = process.env.REPORT_BEARER_TOKEN;
  export const GROUP_ID = process.env.REPORT_GROUP_ID;
}
