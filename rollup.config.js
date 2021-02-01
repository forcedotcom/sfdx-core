import typescript from 'rollup-plugin-typescript2';
import visualizer from 'rollup-plugin-visualizer';

import * as path from 'path';
import * as fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

const input = {};
fs.readdirSync('src', { withFileTypes: true }).forEach(file => {
  if (file.isDirectory()) {
    const dir = file;
    fs.readdirSync(path.join('src', dir.name)).forEach(dirFile => {
      input[path.join(dir.name, path.basename(dirFile, '.ts'))] = path.join('src', dir.name, dirFile);
    });
  } else {
    input[path.basename(file.name, '.ts')] = path.join('src', file.name);
  }
});

export default {
  input,
  output: {
    dir: 'build',
    // file: "build/bundle.js",
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      clean: false,
      tsconfigOverride: {
        compilerOptions: {
          declaration: false
        }
      }
    }),
    isProduction && visualizer()
  ]
};
