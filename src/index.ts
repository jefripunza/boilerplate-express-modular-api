import 'module-alias/register';

import '@/apps/reporter';
import { app, server } from '@/apps/express';
import { DatabaseConnect } from '@/apps/knex';

DatabaseConnect(() => server.listen(app.get('port')));
