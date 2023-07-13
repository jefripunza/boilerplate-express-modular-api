import * as fs from 'fs';
import * as path from 'path';

export const project_root = process.cwd();
export const isTypescript = String(__filename).endsWith('.ts');

// ==================================================================
// ==================================================================
// ==================================================================
//-> Directory

// non usable
const apps_dir = path.join(project_root, 'src', 'apps');
const contracts_dir = path.join(project_root, 'src', 'contracts');
const helpers_dir = path.join(project_root, 'src', 'helpers');
const middlewares_dir = path.join(project_root, 'src', 'middlewares');
const repositories_dir = path.join(
  project_root,
  'src',
  'models',
  'repositories'
);
const tests_dir = path.join(project_root, 'tests');

// usable
export const modules_dir = path.join(
  project_root,
  isTypescript ? 'src' : 'build',
  'modules'
);
export const migrations_dir = path.join(
  project_root,
  'src',
  'models',
  'migrations'
);
export const seeds_dir = path.join(project_root, 'src', 'models', 'seeds');

// ==================================================================

export const public_dir = path.join(project_root, 'assets', 'public');

export const apk_dir = path.join(public_dir, 'apk');
export const user_dir = path.join(public_dir, 'image', 'user');
export const product_dir = path.join(public_dir, 'image', 'product');
export const logo_dir = path.join(public_dir, 'image', 'logo');

// ==================================================================

export const strict_dir = path.join(project_root, 'assets', 'strict');

export const ktp_dir = path.join(strict_dir, 'image', 'ktp');

// ==================================================================
// make directory...

[
  // non usable
  apps_dir,
  contracts_dir,
  helpers_dir,
  middlewares_dir,
  repositories_dir,
  tests_dir,

  // usable
  modules_dir,
  migrations_dir,
  seeds_dir,

  // public
  apk_dir,
  user_dir,
  product_dir,
  logo_dir,

  // strict
  ktp_dir,
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==================================================================
// ==================================================================
// ==================================================================
//-> File

export const swagger_json_file = path.join(project_root, 'swagger.json');
