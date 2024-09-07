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
const configs = files.map(file => {
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

//const configs = []

configs.push({
    input: path.join('src/', 'index.js'),
    cache: false, // Disable cache to avoid stale results
    plugins: [
      babel({
        babelHelpers: 'bundled', // Keep this as 'bundled'
        exclude: 'node_modules/**', // Ensure all JS files are processed
        presets: [
            [
                "@babel/preset-env",
                {
                  "targets": {
                    "esmodules": false,
                    "ie": "11"  // or your desired browser versions
                  },
                  "loose": true,  // Use simpler transformations, reduces helpers
                  "useBuiltIns": false,  // Skip automatic polyfill injection
                  "exclude": [
                    "transform-function-name",  // Skips naming helpers
                    "transform-spread",  // Avoid transforming array spread/rest
                    "transform-arrow-functions",
                    "transform-block-scoping",
                    "transform-classes",
                    "transform-typeof-symbol",  // Skips symbol-related transformations    
                    "transform-for-of",  // Skip for...of transformation
                    //"transform-async-to-generator",
                    "transform-regenerator",
                    // "transform-async-to-generator",
                    /*
                    
                  
                    
          
                    "transform-regenerator",
                    
                   
                    */
                  ]  // Skip async/await transformations
                }
              ]
        ],
        plugins: [
          "@babel/plugin-transform-block-scoping",  // Converts `const` and `let` to `var`
          "@babel/plugin-transform-template-literals",  // Converts template literals to string concatenation
          "@babel/plugin-transform-arrow-functions",
          "transform-remove-console"
        ], // Target ES5
      })
    ],
    output: [
      {
        file: path.join('dist', `GA4CustomTask.js`),
        format: 'umd',
        sourcemap: false,
        exports: 'default',
        name: 'GA4CustomTask',
      },
      {
        file: path.join('dist', `GA4CustomTask.min.js`),
        format: 'umd',
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
