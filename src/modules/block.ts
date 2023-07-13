import { StatusCodes } from 'http-status-codes';
import express, { Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';
import * as reporter from '../apps/reporter';

import * as Block from '../models/repositories/block';

import token_validation from '../middlewares/token_validation';
import only_superman from '../middlewares/only_superman';

const router: any = express.Router();
const app: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

app.get(
  '/paginate',
  // token_validation,
  // only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/block/list'
      #swagger.tags = ['Block']
      #swagger.summary = '(SuperAdmin)'
    */

    const { search, show, page, sort_by, order_by, filter }: any = req.query;

    try {
      const paginate = await Block.paginate(
        search,
        show,
        page,
        sort_by,
        order_by,
        filter
      );

      return res.json(paginate);
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'block/paginate',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

app.post(
  '/new',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/block/new'
      #swagger.tags = ['Block']
      #swagger.summary = '(SuperAdmin)'
    */

    const { identity, ip_address } = req.body;
    if (!(identity && ip_address)) {
      return res.status(400).json({
        message: "body is'n complete!",
      });
    }

    try {
      const isIdentityExist = await Block.whereIdentity(identity);
      if (isIdentityExist) {
        return res.status(400).json({
          message: 'identity is exist!',
        });
      }

      const isIpAddressExist = await Block.whereIP(ip_address);
      if (isIpAddressExist) {
        return res.status(400).json({
          message: 'ip_address is exist!',
        });
      }

      await Block.insert({
        identity,
        ip_address,
      });

      return res.json({
        message: 'success add block',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'block/new',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

app.delete(
  '/:id_block',
  token_validation,
  only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/block/{id_block}'
      #swagger.tags = ['Block']
      #swagger.summary = '(SuperAdmin)'
    */

    const { id_block } = req.params;

    try {
      const isBlockExist = await Block.isBlockExist(id_block);
      if (isBlockExist) {
        return res.status(400).json({
          message: 'block id is not found!',
        });
      }

      await Block.remove(id_block);

      return res.json({
        message: 'success un-block block',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'block/delete',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

router.use('/api/block', app);
router.use('/api/block/v1', v1);
export default router;
