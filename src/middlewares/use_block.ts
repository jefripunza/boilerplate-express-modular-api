import { Response, NextFunction } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import * as Block from '../models/repositories/block';

export default async (req: IRequestJoin, res: Response, next: NextFunction) => {
  const { ip_address } = req;
  const { identity } = req.cookies;

  if (!identity) {
    return res.status(400).json({
      message: 'identity require!'
    });
  }

  const isUserMatch: any = await Block.whereIdentityOrIpIsBlocked(
    identity,
    ip_address
  );
  if (isUserMatch) {
    if (isUserMatch.is_block == 1) {
      return res.status(401).json({
        message: 'you are blocked!',
        is_blocked: true
      });
    }
  } else {
    await Block.insert({
      identity,
      ip_address
    });
  }

  return next();
};
