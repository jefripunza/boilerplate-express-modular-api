/* eslint-disable @typescript-eslint/no-unused-vars */

import express from 'express';
import { public_dir, strict_dir } from '../paths';

import use_block from '../middlewares/use_block';
import token_validation from '../middlewares/token_validation';
import only_admin from '../middlewares/only_admin';

const app: any = express.Router();

// =======================================================================
// =======================================================================
// =======================================================================

// static file
app.use('/assets', express.static(public_dir));
app.use(
  '/strict',
  token_validation,
  use_block,
  only_admin,
  express.static(strict_dir)
);

export default app;
