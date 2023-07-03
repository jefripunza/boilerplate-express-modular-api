import { StatusCodes } from 'http-status-codes';
import express, { Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import * as Setting from '../models/repositories/setting';

import token_validation from '../middlewares/token_validation';
import only_admin from '../middlewares/only_admin';

const router: any = express.Router();
const app: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

app.get(
  '/list',
  token_validation,
  only_admin,
  async (_: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/setting/list'
      #swagger.tags = ['Setting']
      #swagger.summary = '(Admin)'
    */

    try {
      const data = await Setting.list();

      return res.json({
        data
      });
    } catch (error: any) {
      // @ts-ignore
      process.emit('uncaughtException', {
        from: 'setting/list',
        message: error.message
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!'
      });
    }
  }
);

app.post(
  '/new',
  token_validation,
  only_admin,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/setting/new'
      #swagger.tags = ['Setting']
      #swagger.summary = '(Admin)'
    */

    const { key, value } = req.body;

    try {
      const isKeyExist = await Setting.isKeyExist(key);
      if (isKeyExist) {
        return res.status(400).json({
          message: 'key is exist!'
        });
      }

      await Setting.insert({
        key,
        value
      });

      return res.json({
        message: 'success add setting!'
      });
    } catch (error: any) {
      // @ts-ignore
      process.emit('uncaughtException', {
        from: 'setting/new',
        message: error.message
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!'
      });
    }
  }
);
app.put(
  '/',
  token_validation,
  only_admin,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/setting'
      #swagger.tags = ['Setting']
      #swagger.summary = '(Admin)'
    */

    const { key, value } = req.body;

    try {
      const isKeyExist = await Setting.isKeyExist(key);
      if (!isKeyExist) {
        return res.status(400).json({
          message: 'key is not found!'
        });
      }

      await Setting.update(key, value);

      return res.json({
        message: 'success edit setting!'
      });
    } catch (error: any) {
      // @ts-ignore
      process.emit('uncaughtException', {
        from: 'setting/edit',
        message: error.message
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!'
      });
    }
  }
);

router.use('/api/setting', app);
router.use('/api/setting/v1', v1);
export default router;
