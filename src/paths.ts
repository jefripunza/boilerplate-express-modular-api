import * as fs from 'fs';
import * as path from 'path';

export const project_root = process.cwd();
export const isTypescript = String(__filename).endsWith('.ts');

// ==================================================================
//-> Directory

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

export const user_dir = path.join(
  project_root,
  'assets',
  'public',
  'image',
  'user'
);
if (!fs.existsSync(user_dir)) {
  fs.mkdirSync(user_dir, { recursive: true });
}

// ==================================================================
//-> File

export const swagger_json_file = path.join(project_root, 'swagger.json');
