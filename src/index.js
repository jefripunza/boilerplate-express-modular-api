const { PORT } = require("./config");
const { server } = require("./apps/express");
const { DatabaseConnect } = require("./apps/knex");
const { StartLogging } = require("./apps/reporter");

StartLogging();
DatabaseConnect(() => {
  server.listen(PORT, () => {
    console.log(`✈️  Server listening on http://localhost:${PORT}`);
  });
});
