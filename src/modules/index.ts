/* eslint-disable @typescript-eslint/no-unused-vars */

import { StatusCodes } from 'http-status-codes';
import express, { Request, Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import token_validation from '../middlewares/token_validation';
import only_admin from '../middlewares/only_admin';
import only_basic from '../middlewares/only_basic';

const router: any = express.Router();
const app: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

router.get('/', async (req: IRequestJoin, res: Response) => {
  /**
    #swagger.tags = ['Index']
    #swagger.summary = '(*)'
  */

  try {
    return res.json({ message: 'welcome...' });
  } catch (error: any) {
    // @ts-ignore
    process.emit('uncaughtException', {
      from: 'index/root',
      message: error.message
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error!'
    });
  }
});

router.use('/api/example', app);
router.use('/api/example/v1', v1);
export default router;
