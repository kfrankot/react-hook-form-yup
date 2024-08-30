import { babel } from '@rollup/plugin-babel'
import includePaths from 'rollup-plugin-includepaths'
import license from 'rollup-plugin-license'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const banner = `
@preserve
Kevin Frankot - <%= pkg.name %> v<%= pkg.version %>
`

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
      },
    ],
    external: [
      'react',
      'yup',
      'react-hook-form',
      '@hookform/resolvers/yup',
      'yup-field-props-react',
      'flat',
      '@radix-ui/react-use-callback-ref',
    ],
    plugins: [
      license({
        banner,
      }),
      includePaths({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      terser(),
    ],
  },
]
