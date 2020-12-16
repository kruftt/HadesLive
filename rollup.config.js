import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/HadesLive.js',
  output: {
    dir: 'dist',
    format: 'iife',
  },
  plugins: [
    nodeResolve({
      exportConditions: ['browser'],
      browser: true,
      mainFields: ['browser']
    }),
    commonjs(),
  ],
};
