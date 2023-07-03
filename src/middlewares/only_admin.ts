import { Response, NextFunction } from 'express';
import { IRequestJoin } from '../contracts/request.contract';
import { user_roles } from '../configs';

export default (req: IRequestJoin, res: Response, next: NextFunction) => {
  if ([user_roles.superadmin, user_roles.admin].includes(req.user.role)) {
    return next();
  }
  return res.status(401).json({
    message: 'Only Admin !!!'
  });
};
