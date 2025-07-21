import { removeSync, copySync } from 'fs-extra/esm';
import path from 'path';

removeSync(path.resolve(import.meta.dirname, './public/monaco-editor'));

copySync(
  path.resolve(import.meta.dirname, './node_modules/monaco-editor/min'),
  path.resolve(import.meta.dirname, './public/monaco-editor'),
);
