import * as fs from 'fs';
import * as path from 'path';
import http from 'http';
import express from 'express';

import { FileUploader } from '../configs';
import { Server } from '../environments';
import { project_root, swagger_json_file, modules_dir } from '../paths';
import * as random from '../helpers/random';

// Declare Module Middlewares...
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';

const app = express();
const server = http.createServer(app);

//-> Identitas User Request
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());
const key_identity = 'identity';
app.use(function (req: any, res, next) {
  req.ip_address =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress;
  // check if client sent cookie
  if (req.cookies[key_identity] === undefined) {
    // set a new cookie
    res.cookie(key_identity, random.Text(18), {
      httpOnly: true,
    });
  }
  next(); // <-- important!
});

//-> middlewares
// for security
app.disable('x-powered-by');
app.use(cors());
app.use(helmet());
// for data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// management file upload
app.use(
  fileUpload({
    limits: {
      fileSize: FileUploader.max_file_upload_size * 1024 * 1024, // MB
    },
  })
);

// Documentation
if (!Server.isProduction) {
  app.use(
    '/swagger',
    swaggerUi.serve,
    swaggerUi.setup(
      JSON.parse(fs.readFileSync(swagger_json_file, { encoding: 'utf-8' }))
    )
  );
}

// logger
app.use(morgan('dev')); // skip swagger

Promise.resolve()
  .then(async () => {
    //-> Automatic Listing Modules
    const waiting = fs.readdirSync(modules_dir).map(async (module) => {
      const module_import = await import(path.join(modules_dir, module));
      // const isClass =
      //   typeof module_import.default == 'function' &&
      //   !module_import.default.stack;
      app.use(module_import.default);
      // eslint-disable-next-line no-console
      console.log(`✅ Module ${module} Loaded!`);
      return module;
    });
    return waiting;
  })
  .then(async () => {
    // 404 : Endpoint Not Found !!!
    app.all('*', (req, res) => {
      if (
        !['get', 'post', 'put', 'patch', 'delete'].includes(
          String(req.method).toLowerCase()
        )
      ) {
        return res.status(403).send('forbidden');
      }
      return res.status(404).json({
        message: 'endpoint not found!',
      });
    });
  });

app.set('port', Server.PORT);
server.on('listening', () =>
  // eslint-disable-next-line no-console
  console.log(`✈️  Server listening on http://localhost:${Server.PORT}/swagger`)
);

export { app, server };
