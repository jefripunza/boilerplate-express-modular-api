import { StatusCodes } from 'http-status-codes';
import express, { Request, Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';

import { user_roles } from '../configs';
import { Server, OTP_EXPIRED_MINUTE } from '../environments';

import * as User from '../models/repositories/user';

import * as random from '../helpers/random';
import * as jwt from '../utils/jsonwebtoken';
import * as encryption from '../utils/encryption';

import token_validation from '../middlewares/token_validation';

const checkMobile = (req: Request) =>
  ['dart'].some((slug) =>
    String(req.headers['user-agent']).toLowerCase().includes(slug)
  );

const router: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

v1.post('/register', async (req: Request, res: Response) => {
  /**
    #swagger.path = '/api/auth/v1/register'
    #swagger.tags = ['Auth']
  */

  const { name, username, phone_number, password } = req.body;

  if (!(name && username && phone_number && password)) {
    return res.status(400).json({
      message: "body is'n complete!"
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: 'password must be length up to 8 character!'
    });
  }

  try {
    const isUserExist = await User.isUsernameExist(username);
    if (isUserExist) {
      if (isUserExist.is_verify) {
        return res.status(400).json({
          message: 'phone number is already register!'
        });
      }
      if (isUserExist.is_block) {
        return res.status(400).json({
          message: 'Sorry, your phone number is blocked!'
        });
      }
      const now = new Date();
      const expired_token = new Date(isUserExist.otp_start_date);
      expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED_MINUTE);
      if (now.getTime() < expired_token.getTime()) {
        if (isUserExist.otp_count >= 3) {
          return res.status(400).json({
            message: 'waiting expired OTP!'
          });
        }
        return res.status(400).json({
          message: 'token already can use!'
        });
      }
    }

    const otp_secret = random.Text(19);
    const otp_code = random.OTP(6);

    // send OTP...

    const otp_management = {
      otp_secret,
      otp_code,
      otp_count: 0,
      otp_start_date: new Date()
    };
    if (isUserExist) {
      await User.updateByUsername(username, {
        name,
        phone_number,
        password,

        ...otp_management
      });
    } else {
      await User.insert({
        name,
        username,
        phone_number,
        password,

        ...otp_management
      });
    }

    return res.json({
      message: 'Please validate your OTP code!',
      otp_secret
    });
  } catch (error: any) {
    // @ts-ignore
    process.emit('uncaughtException', {
      from: 'auth/register',
      message: error.message
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error!'
    });
  }
});

v1.post('/login', async (req: Request, res: Response) => {
  /**
    #swagger.path = '/api/auth/v1/login'
    #swagger.tags = ['Auth']
  */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = checkMobile(req);

  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).json({
      message: "body is'n complete!"
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: 'password must be length up to 8 character!'
    });
  }

  try {
    const isLogin: any = await User.isLogin(username, password);
    if (!isLogin) {
      return res.status(400).json({
        message: 'username or password is wrong!'
      });
    }
    if (isLogin.is_block) {
      return res.status(400).json({
        message: 'Sorry, your phone number is blocked!'
      });
    }
    if (isLogin.activity_at) {
      const now = new Date();
      const expired_login = new Date(isLogin.activity_at);
      if (now.getTime() < expired_login.getTime()) {
        return res.status(400).json({
          message: 'Sorry, the account is already signed in on another device!'
        });
      }
    }
    // if (!Server.isLocal) {
    //   if (isMobile) {
    //     // mobile
    //     if (![user_roles.basic].includes(isLogin.role)) {
    //       return res.status(400).json({
    //         message: 'Sorry, login only basic user!'
    //       });
    //     }
    //   } else {
    //     //web
    //     if (![user_roles.superadmin, user_roles.admin].includes(isLogin.role)) {
    //       return res.status(400).json({
    //         message: 'Sorry, login only admin & approval user!'
    //       });
    //     }
    //   }
    // }
    const now = new Date();
    const expired_token = new Date(isLogin.otp_start_date);
    expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED_MINUTE);
    if (now.getTime() < expired_token.getTime()) {
      return res.status(400).json({
        message: 'waiting expired OTP!'
      });
    }

    const otp_secret = random.Text(19);
    const otp_code = random.OTP(6);

    // update
    await User.updateByUsername(username, {
      otp_secret,
      otp_code,
      otp_count: 0,
      otp_start_date: new Date()
    });

    return res.json({
      message: 'Please validate your OTP code!',
      otp_secret
    });
  } catch (error: any) {
    // @ts-ignore
    process.emit('uncaughtException', {
      from: 'auth/login',
      message: error.message
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error!'
    });
  }
});

v1.post('/token-validate/:mode', async (req: Request, res: Response) => {
  /**
    #swagger.path = '/api/auth/v1/token-validate/{mode}'
    #swagger.tags = ['Auth']
  */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = checkMobile(req);

  const { otp_secret, otp_code } = req.body;

  if (!(otp_secret && otp_code)) {
    return res.status(400).json({
      message: "body is'n complete!"
    });
  }

  try {
    const isExist: any = await User.isOtpSecretExist(otp_secret);
    if (!isExist) {
      return res.status(400).json({
        message: 'otp_secret not found!'
      });
    }
    if (isExist.otp_count >= 3) {
      return res.status(400).json({
        message: 'please send new OTP!'
      });
    }
    await User.increaseOtpCount(otp_code, isExist.otp_count);

    const now = new Date();
    const expired_token = new Date(isExist.otp_start_date);
    expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED_MINUTE);
    if (now.getTime() >= expired_token.getTime()) {
      return res.status(400).json({
        message: 'OTP is expired!'
      });
    }
    if (isExist.otp_code != otp_code) {
      return res.status(400).json({
        message: 'OTP not match!'
      });
    }

    // reset
    const expired_login = new Date();
    expired_login.setDate(expired_login.getDate() + 7);
    const changes = {
      otp_secret: null,
      otp_code: null,
      otp_count: 0,
      otp_start_date: null,

      is_verify: true,
      activity_at: expired_login
    };

    await User.updateByOtpSecret(otp_secret, changes);

    // create token
    const token = jwt.createToken({
      id: isExist.id,
      role: isExist.role
    });

    res.cookie('token', token, {
      httpOnly: true
    });
    return res.json({
      message: `tokens are correct!`,
      token,
      username: isExist.username,
      role: isExist.role
    });
  } catch (error: any) {
    // @ts-ignore
    process.emit('uncaughtException', {
      from: 'auth/token-validate',
      message: error.message
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error!'
    });
  }
});

v1.delete(
  '/logout',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/auth/v1/logout'
      #swagger.tags = ['Auth']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(*)'
    */

    const id_user = req.user.id;

    await User.logoutClearActivity(id_user);
    res.clearCookie('token');

    return res.json({
      message: 'success logout!'
    });
  }
);

router.use('/api/auth/v1', v1);
export default router;
