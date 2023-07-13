import * as path from 'path';
import { StatusCodes } from 'http-status-codes';
import { UploadedFile } from 'express-fileupload';
import express, { Response } from 'express';
import { IRequestJoin } from '../contracts/request.contract';
import * as reporter from '../apps/reporter';

import * as User from '../models/repositories/user';
import * as UserAddress from '../models/repositories/user_address';

import { FileUploader } from '../configs';
import { user_dir } from '../paths';
import { newNameUpload } from '../helpers/convert';

import token_validation from '../middlewares/token_validation';
import only_basic from '../middlewares/only_basic';

const router: any = express.Router();
const app: any = express.Router();
const v1: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================
// -> Users

app.get('/init', token_validation, async (req: IRequestJoin, res: Response) => {
  /**
    #swagger.path = '/api/user/init'
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(*)'
   */

  const result = await User.init(req.user.id);

  return res.json({
    ...result,
  });
});

app.get(
  '/paginate',
  // token_validation,
  // only_superman,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/paginate'
      #swagger.tags = ['User']
      #swagger.summary = '(SuperAdmin)'
    */

    const { search, show, page, sort_by, order_by, filter } = req.query;

    try {
      const paginate = await User.paginate(
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
        from: 'user/paginate',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

app.put(
  '/',
  token_validation,
  only_basic,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user'
      #swagger.tags = ['User']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic)'
    */

    const id_user = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "body is'n complete!",
      });
    }

    await User.update(id_user, {
      name,
    });

    return res.json({
      message: 'success edit user!',
    });
  }
);

app.patch(
  '/update-image',
  token_validation,
  only_basic,
  async (req: IRequestJoin, res: Response) => {
    /*
      #swagger.path = '/api/user/update-image'
      #swagger.tags = ['User']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic)'

      #swagger.consumes = ['multipart/form-data']  
      #swagger.parameters['image'] = {
          in: 'formData',
          type: 'file',
          required: 'true',
          description: 'Upload Image...',
      }
    */

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        message: 'No image were uploaded.',
      });
    }

    const image = req.files.image as UploadedFile;
    if (
      FileUploader.allow_file_extension_image.includes(
        String(path.extname(image.name)).toLowerCase()
      )
    ) {
      return res.status(400).json({
        message: 'file image only.',
      });
    }
    if (image.size > FileUploader.max_upload_image * 1024 * 1024) {
      return res.status(400).json({
        message: `File size is too large. ${FileUploader.max_upload_image}MB maximum.`,
      });
    }

    const new_name = 'user_basic_' + newNameUpload(image.name);

    image.mv(path.join(user_dir, new_name), async (error) => {
      if (error) {
        return res.status(500).json({
          message: 'failed upload file...',
        });
      }

      return res.json({
        filename: new_name,
      });
    });
  }
);

v1.put(
  '/change-password',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/change-password'
      #swagger.tags = ['User']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(*)'
    */

    const id_user = req.user.id;
    const { password, re_password } = req.body;

    if (!(password && re_password)) {
      return res.status(400).json({
        message: "body is'n complete!",
      });
    }

    if (password != re_password) {
      return res.status(400).json({
        message: 'password not match!',
      });
    }

    try {
      await User.update(id_user, { password });

      return res.json({
        message: 'success change password user!',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/change-password',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

// =======================================================================
// =======================================================================
// =======================================================================
// -> User Address

v1.get(
  '/address',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/address'
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const data = await UserAddress.list(req.user.id);

    try {
      return res.json({ data });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/address(get)',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

v1.post(
  '/address',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/address'
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const id_user = req.user.id;
    const { subdistrict_code, detail, is_use } = req.body;

    try {
      const isSubdistrictExist = await UserAddress.isSubdistrictExist(
        id_user,
        subdistrict_code
      );
      if (isSubdistrictExist) {
        return res.status(400).json({
          message: 'subdistrict_code is exist!',
        });
      }

      await UserAddress.insert({
        id_user,

        subdistrict_code,
        detail,
        is_use,
      });

      return res.json({
        message: 'success add address user!',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/address(post)',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

v1.put(
  '/address/:id_user_address',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/address/{id_user_address}'
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const id_user = req.user.id;
    const { id_user_address } = req.params;
    const { subdistrict_code, detail } = req.body;

    try {
      const isAddressExist = await UserAddress.isAddressExist(
        id_user,
        parseInt(id_user_address)
      );
      if (!isAddressExist) {
        return res.status(400).json({
          message: "address id is'n found!",
        });
      }

      if (subdistrict_code) {
        const isSubdistrictExist = await UserAddress.isSubdistrictExist(
          id_user,
          subdistrict_code
        );
        if (isSubdistrictExist) {
          return res.status(400).json({
            message: 'subdistrict_code is exist!',
          });
        }
      }

      await UserAddress.update(id_user, parseInt(id_user_address), {
        subdistrict_code,
        detail,
      });

      return res.json({
        message: 'success edit address user!',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/address(put:id_user_address)',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

v1.patch(
  '/main-address/:id_user_address',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/main-address/{id_user_address}'
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const id_user = req.user.id;
    const { id_user_address } = req.body;

    try {
      const isAddressExist = await UserAddress.isAddressExist(
        id_user,
        id_user_address
      );
      if (!isAddressExist) {
        return res.status(400).json({
          message: "address id is'n found!",
        });
      }

      await UserAddress.changeMain(id_user, id_user_address);

      return res.json({
        message: 'success change main address user!',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/main-address(patch:id_user_address)',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

v1.delete(
  '/address/:id_user_address',
  token_validation,
  async (req: IRequestJoin, res: Response) => {
    /**
      #swagger.path = '/api/user/v1/address/{id_user_address}'
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const id_user = req.user.id;
    const { id_user_address } = req.body;

    try {
      const isAddressExist = await UserAddress.isAddressExist(
        id_user,
        id_user_address
      );
      if (!isAddressExist) {
        return res.status(400).json({
          message: "address id is'n found!",
        });
      }

      await UserAddress.remove(id_user, id_user_address);

      return res.json({
        message: 'success delete address user!',
      });
    } catch (error: any) {
      reporter.sendErrorLog({
        from: 'user/address(delete:id_user_address)',
        error,
      });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error!',
      });
    }
  }
);

router.use('/api/user', app);
router.use('/api/user/v1', v1);
export default router;
