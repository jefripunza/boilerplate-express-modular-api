import jwt from 'jsonwebtoken';
import { Jwt } from '../environments';
import { ITokenContent } from '../contracts/request.contract';

export const createToken = (object: object) => {
  return jwt.sign(object, Jwt.SECRET_TOKEN, {
    expiresIn: Jwt.EXPIRED_TOKEN,
  });
};

interface IJwtExtract {
  exp: number;
}
export interface IJwtData extends ITokenContent, IJwtExtract {}

interface IVerifyToken {
  data: IJwtData;
  error?: number;
  message?: string;
}
export const verifyToken = async (token: string): Promise<IVerifyToken> => {
  const data_undefined: any = undefined;
  if (token) {
    return await new Promise((resolve) => {
      jwt.verify(token, Jwt.SECRET_TOKEN, (err, data: any) => {
        if (err) {
          resolve({
            error: 401,
            message: 'Not Authorized',
            data: data_undefined,
          });
        }
        resolve({
          data,
        });
      });
    });
  }
  return {
    error: 403,
    message: 'Authorization Bearer is required!',
    data: data_undefined,
  };
};
