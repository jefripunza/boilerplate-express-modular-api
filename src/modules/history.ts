import { StatusCodes } from 'http-status-codes';
import express, { Response } from 'express';
import { IRequestJoin } from '@/contracts/request.contract';
import * as reporter from '@/apps/reporter';

import * as History from '@/models/repositories/history';

import token_validation from '@/middlewares/token_validation';
import only_superman from '@/middlewares/only_superman';

const router: any = express.Router();
const app: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

app.get(
  '/list',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/history/list'
      #swagger.tags = ['History']
      #swagger.summary = '(SuperAdmin)'
    */

    try {
      const data = await History.list();

      return res.json({
        data,
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'history/list',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

router.use('/api/history', app);
router.use('/api/history/v1', v1);
export default router;
