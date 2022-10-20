import commonjs from 'rollup-plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'mysql-sql',
    exports: 'default'
  },
  plugins: [json(), nodeResolve(),commonjs(), terser()]
}
