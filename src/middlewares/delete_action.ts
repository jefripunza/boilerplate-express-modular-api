import { Response, NextFunction } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import * as User from '../models/repositories/user';

export default async (req: IRequestJoin, res: Response, next: NextFunction) => {
  const id_user = req.user.id;
  const { password }: any = req.query;

  if (!password) {
    return res.status(400).json({
      message: 'password require!',
    });
  }

  const isUserMatch = await User.findByPasswordAndID(id_user, password);
  if (!isUserMatch) {
    return res.status(401).json({
      message: 'wrong password!',
    });
  }

  return next();
};
