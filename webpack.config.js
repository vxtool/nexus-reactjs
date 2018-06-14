const webpack = require('webpack')

module.exports = {
  entry: './example-20/index.js',
  output: {
    path: __dirname + '/public',
    filename: './bundle.js'
  },
  devServer: {
    port: 8080,
    contentBase: './public',
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /.js[x]?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react'],
        plugins: ['transform-object-rest-spread']
      }
    }]
  }
}
