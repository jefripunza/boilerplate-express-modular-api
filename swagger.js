const fs = require("fs");
const path = require("path");

const {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  APP_SCHEMES,
  CONTACT_NAME,
  CONTACT_EMAIL,

  PORT,
} = require("./src/config");
const { modules_dir, swagger_json_file } = require("./src/paths");

const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: APP_NAME,
    version: APP_VERSION,
    description: APP_DESCRIPTION,
    termsOfService: "http://swagger.io/terms/",
    contact: {
      name: CONTACT_NAME,
      email: CONTACT_EMAIL,
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host: `localhost:${PORT}`,
  basePath: "/",
  schemes: APP_SCHEMES,
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    // {
    //   name: "Auth",
    // },
  ],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "Enter your bearer token in the format **Bearer &lt;token>**",
    },
  },
  definitions: {
    only_message: {
      message: "string",
    },
  },
  components: {}, // by default: empty object (OpenAPI 3.x)
};

const endpointsFiles = fs
  .readdirSync(modules_dir)
  .filter((filename) => filename !== "index.js")
  .map((filename) => path.join(modules_dir, filename));

swaggerAutogen(swagger_json_file, endpointsFiles, doc);
