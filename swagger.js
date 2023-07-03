/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

require('ts-node/register');

const fs = require('fs');
const path = require('path');

const { Swagger, Server } = require('./src/environments');
const { modules_dir, swagger_json_file } = require('./src/paths');

const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: Swagger.APP_NAME,
    version: Swagger.APP_VERSION,
    description: Swagger.APP_DESCRIPTION,
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      name: Swagger.CONTACT_NAME,
      email: Swagger.CONTACT_EMAIL
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  host: `localhost:${Server.PORT}`,
  basePath: '/',
  schemes: Swagger.APP_SCHEMES,
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    // {
    //   name: "Auth",
    // },
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your bearer token in the format **Bearer &lt;token>**'
    }
  },
  definitions: {
    only_message: {
      message: 'string'
    }
  },
  components: {} // by default: empty object (OpenAPI 3.x)
};

const endpointsFiles = fs
  .readdirSync(modules_dir)
  .filter((filename) => filename !== 'index.js')
  .map((filename) => path.join(modules_dir, filename));

swaggerAutogen(swagger_json_file, endpointsFiles, doc);
