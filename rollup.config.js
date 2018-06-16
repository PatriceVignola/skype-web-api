import flow from 'rollup-plugin-flow';
import {uglify} from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const env = process.env.ROLLUP_ENV;

const config = {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'SkypeAPI',
  },
  plugins: [
    flow({
      pretty: true,
    }),
    nodeResolve(),
    commonjs(),
  ],
};

if (env === 'production') {
  config.plugins.push(uglify({}, minify));
}

export default config;
