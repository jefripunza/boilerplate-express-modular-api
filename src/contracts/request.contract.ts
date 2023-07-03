import { Request } from 'express';

export interface ITokenContent {
  id: number;
  role: string;
}

interface IReqUser {
  user: ITokenContent;
  ip_address: string;
}
export interface IRequestJoin extends Request, IReqUser {}
