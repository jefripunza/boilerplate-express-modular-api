const fs = require("fs");
const path = require("path");

const express = require("express");
const http = require("http");

const { isProduction, max_file_upload_size } = require("../config");
const { project_root, swagger_json_file, modules_dir } = require("../paths");
const random = require("../helpers/random");

const app = express();
const server = http.createServer(app);

//-> Identitas User Request
// need cookieParser middleware before we can do anything with cookies
app.use(require("cookie-parser")());
const key_identity = "identity";
app.use(function (req, res, next) {
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
app.disable("x-powered-by");
app.use(require("helmet")());
app.use(require("cors")());

// static file
app.use("/assets", express.static(path.join(project_root, "assets", "public")));
app.use("/strict", express.static(path.join(project_root, "assets", "strict"))); // sementara

// logger
app.use(require("morgan")("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// management file upload
app.use(
  require("express-fileupload")({
    limits: {
      fileSize: max_file_upload_size * 1024 * 1024, // MB
    },
  })
);

// Documentation
const swaggerUi = require("swagger-ui-express");
if (!isProduction) {
  app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(require(swagger_json_file))
  );
}

//-> Automatic Listing Modules
const modules = fs.readdirSync(modules_dir);
for (let i = 0; i < modules.length; i++) {
  const module = modules[i];
  console.log(`✅ Module ${module} Loaded!`);
  app.use(require(path.join(modules_dir, module)));
}

// 404 : Page Not Found !!!
app.all("*", (req, res) => {
  if (
    !["get", "post", "put", "patch", "delete"].includes(
      String(req.method).toLowerCase()
    )
  ) {
    return res.status(403).send("forbidden");
  }
  return res.status(404).json({
    message: "endpoint not found!",
  });
});

// Promise.resolve()
//   .then(async () => {})
//   .then(async () => {})
//   .then(async () => {});

module.exports = {
  app,
  server,
};
