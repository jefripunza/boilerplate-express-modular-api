/* eslint-disable no-console */
import express, { Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import { Server } from '../environments';

import token_validation from '../middlewares/token_validation';
import only_superman from '../middlewares/only_superman';

import cron from 'node-cron';

const router: any = express.Router();
const app: any = express.Router();

const options: cron.ScheduleOptions = {
  scheduled: false,
  timezone: Server.TZ
};
/**
 * @param {string} cronExpression
 * @param {function} func
 * @returns
 */
const schedule = (
  cronExpression: string,
  func: string | ((now: Date | 'manual' | 'init') => void)
) => cron.schedule(cronExpression, func, options);

// ==========================================================================
// ==========================================================================
interface ITaskDetail {
  task: cron.ScheduledTask;
  status: boolean;
}
interface ITask {
  [key: string]: ITaskDetail;
}
const tasks: ITask = {};

tasks['test'] = {
  task: schedule('* * * * *', async () => {
    const now = new Date();
    console.log('running test task...', { now: now.toLocaleString() });
  }),
  status: Server.isDevelopment || Server.isProduction ? false : true
};

// ==========================================================================
// ==========================================================================

Object.keys(tasks).forEach((key) => {
  if (tasks[key].status) {
    tasks[key].task.start();
    console.log(`✅ Task : ${key}`);
    return;
  }
  tasks[key].task.stop();
});

// ==========================================================================
// ==========================================================================
// ==========================================================================

app.get(
  '/',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/task'
      #swagger.tags = ['Task']
      #swagger.summary = '(Super Admin)'
    */

    const list_task = Object.keys(tasks).map((key) => {
      return {
        key,
        status: tasks[key].status
      };
    });
    return res.json({ task: list_task });
  }
);

app.patch(
  '/:key/start',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/task/{key}/start'
      #swagger.tags = ['Task']
      #swagger.summary = '(Super Admin)'
    */

    const { key } = req.params;
    if (!tasks[key]) {
      return res.json({ message: 'task not found!' });
    }
    if (tasks[key].status) {
      return res.json({ message: 'task already active!' });
    }

    tasks[key].task.start();
    tasks[key].status = true;

    return res.json({ message: 'success start task!' });
  }
);

app.patch(
  '/:key/stop',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/task/{key}/stop'
      #swagger.tags = ['Task']
      #swagger.summary = '(Super Admin)'
    */

    const { key } = req.params;
    if (!tasks[key]) {
      return res.json({ message: 'task not found!' });
    }
    if (!tasks[key].status) {
      return res.json({ message: 'task already inactive!' });
    }

    tasks[key].task.stop();
    tasks[key].status = false;

    return res.json({ message: 'success stop task!' });
  }
);

router.use('/api/task', app);
export default router;
