import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

export default [
  {
    input: './src/index.js',
    watch: {
      include: './src/**',
      clearScreen: false
    },
    output: {
      file: './build/bundle.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        browser: true
      }),
      commonjs(),
      babel({ babelHelpers: 'bundled' }),
    ]
  }
];