import { Server } from './environments';
import { server } from './apps/express';
import { DatabaseConnect } from './apps/knex';
import { StartLogging } from './apps/reporter';

StartLogging();
DatabaseConnect(() => {
  server.listen(Server.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✈️  Server listening on http://localhost:${Server.PORT}`);
  });
});
