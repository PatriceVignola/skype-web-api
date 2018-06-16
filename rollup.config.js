import flow from 'rollup-plugin-flow';
import {uglify} from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

const env = process.env.ROLLUP_ENV;

const config = {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'SkypeApi',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    }),
    flow({
      pretty: true,
    }),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs({
      namedExports: {
        'node_modules/js-sha256/src/sha256.js': ['sha256']
      }
    }),
    json()
  ]
};

if (env === 'production') {
  config.plugins.push(uglify({}, minify));
}

export default config;
