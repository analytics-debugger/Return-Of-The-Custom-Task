import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import { performance } from 'perf_hooks';

const srcDir = 'src/tasks';
const distDir = 'dist/tasks';

// Ensure the output directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Get all TypeScript files from srcDir
const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.ts'));

// Create Rollup configurations dynamically
/* const configs = files.map(file => {
  const baseName = path.basename(file, '.ts');
  return {
    input: path.join(srcDir, file),
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'bundled',
        presets: [['@babel/preset-env', { targets: 'defaults' }]],
        exclude: 'node_modules/**'
      })
    ],
    output: [
      {
        file: path.join(distDir, `${baseName}.js`),
        format: 'iife',
        sourcemap: false,
        exports: 'default',
        name: baseName,
      },
      {
        file: path.join(distDir, `${baseName}.min.js`),
        format: 'iife',
        sourcemap: false,
        exports: 'default',
        name: baseName,
        plugins: [terser()] // Minified version
      }
    ],
  };
});
*/
const configs = []

configs.push({
    input: path.join('src/', 'index.js'),
    cache: false, // Disable cache to avoid stale results
    plugins: [
      
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**', // Ensure all JS files are processed
        plugins: [
            [
              "@babel/plugin-transform-runtime",
              {
                "corejs": 3
              }
            ]
          ],
        presets: [
            [
                "@babel/preset-env",
                {
                    "targets": "IE 11",
                    "useBuiltIns": "usage",
                    "corejs": 3
                }
              ]
        ] // Target ES5
      })
    ],
    output: [
      {
        file: path.join('dist', `GA4CustomTask.js`),
        format: 'iife',
        sourcemap: false,
        exports: 'default',
        name: 'GA4CustomTask',
      },
      {
        file: path.join('dist', `GA4CustomTask.min.js`),
        format: 'iife',
        sourcemap: false,
        exports: 'default',
        name: 'GA4CustomTask',
        plugins: [terser()] // Minified version
      }
    ],
  });

// Collect build statistics
const buildStats = {};

const buildAndLog = async (config) => {
  // Build non-minified version
  const nonMinifiedStartTime = performance.now();
  const bundle = await rollup(config);
  const nonMinifiedOutput = config.output.find(output => !output.file.endsWith('.min.js'));
  await bundle.write(nonMinifiedOutput);
  const nonMinifiedEndTime = performance.now();

  // Build minified version
  const minifiedStartTime = performance.now();
  const minifiedOutput = config.output.find(output => output.file.endsWith('.min.js'));
  await bundle.write(minifiedOutput);
  const minifiedEndTime = performance.now();

  // Collect statistics
  const baseName = path.basename(nonMinifiedOutput.file, '.js');
  buildStats[baseName] = {
    nonMinifiedSize: (fs.statSync(nonMinifiedOutput.file).size / 1024).toFixed(2) + ' KB', // Size in KB
    nonMinifiedTime: (nonMinifiedEndTime - nonMinifiedStartTime).toFixed(2) + ' ms', // Time in ms
    minifiedSize: (fs.statSync(minifiedOutput.file).size / 1024).toFixed(2) + ' KB', // Size in KB
    minifiedTime: (minifiedEndTime - minifiedStartTime).toFixed(2) + ' ms', // Time in ms
  };
};

// Build all files and log details
const buildAll = async () => {
  for (const config of configs) {
    await buildAndLog(config);
  }

  // Print the build summary
  console.log('\nBuild Summary:');
  console.table(buildStats);
};

// Execute build
buildAll().catch(error => {
  console.error('Build failed:', error);
});

export default configs;
