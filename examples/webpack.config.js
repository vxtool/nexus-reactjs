const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './example-16/index.js',
  output: {
    path: path.resolve(__dirname, '/public'),
    filename: './bundle.js'
  },
  devServer: {
    port: 8000,
    contentBase: './public',
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [{
      test: /.js?$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  }
}
