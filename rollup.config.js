import babel from 'rollup-plugin-babel';

export default {
  entry: 'dev/index.js',
  format: 'cjs',
  plugins: [ babel() ],
  dest: 'dist/index.js'
};
