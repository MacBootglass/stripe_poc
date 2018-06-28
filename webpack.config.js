const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './public/js/index.js',
  output: {
    path: path.resolve(__dirname, 'public/build'),
    filename: 'index.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          },
        ],
      },
    ],
  },
  stats: {
    colors: true
  },
  devtool: 'source-map',
};