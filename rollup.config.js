import path from 'path';
import fs from 'fs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

function getEntryPoints() {
  const entries = {};
  
  // Handle src directory
  const srcIndex = path.resolve('src/index.ts');
  if (fs.existsSync(srcIndex)) {
    entries['GA4CustomTask'] = srcIndex;
  }

  // Handle tasks directory
  const tasksDir = path.resolve('tasks');
  fs.readdirSync(tasksDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isDirectory()) {
      const subDir = path.join(tasksDir, entry.name);
      const indexFile = path.join(subDir, 'index.ts');
      if (fs.existsSync(indexFile)) {
        entries[entry.name] = indexFile;
      }
    }
  });

  return entries;
}

const entries = getEntryPoints();
const outputDir = path.resolve('dist');

const configs = Object.entries(entries).map(([name, input]) => {
  const isSrc = name === 'GA4CustomTask';
  const outputPath = isSrc
    ? path.join(outputDir, `${name}.js`)
    : path.join(outputDir, 'tasks', `${name}.js`);

  return {
    input,
    output: [
      {
        file: outputPath,
        format: isSrc ? 'umd' : 'iife',
        sourcemap: false,
        name: isSrc ? 'GA4CustomTask' : name,
        exports: 'default',
      },
      {
        file: outputPath.replace(/\.js$/, '.min.js'),
        format: isSrc ? 'umd' : 'iife',
        sourcemap: false,
        name: isSrc ? 'GA4CustomTask' : name,
        exports: 'default',
        plugins: [ terser({
          compress: {
            drop_console: false,
          },
          format: {
            beautify: false,
            comments: false,
          }
        })],
      },
    ],
    plugins: [
      nodeResolve({
        extensions: ['.js', '.ts'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: false,
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env'],
      }),      
    ],
  };
});

export default configs;
