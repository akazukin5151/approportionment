const path = require('path');

module.exports = {
  entry: {
    index: './typescript/main/index.ts',
    langs: {
      import: './typescript/langs/langs.ts',
      filename: 'langs/index.js'
    },
    mal: {
      import: './typescript/myanimelist/myanimelist.ts',
      filename: 'myanimelist/index.js'
    },
    langs_pairwise: {
      import: './typescript/langs_pairwise/main.ts',
      filename: 'langs_pairwise/index.js'
    },
    langs_matrix: {
      import: './typescript/langs_matrix/main.ts',
      filename: 'langs_matrix/index.js'
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
