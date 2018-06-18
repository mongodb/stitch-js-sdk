const path = require('path');

module.exports = {
  entry: './src/app/index.jsx',
  output: {
    path: __dirname + '/public',
    filename: 'build/app.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      { 
          test: /\.jsx?$/, 
          loader: 'babel-loader',
          exclude: [
              path.resolve(__dirname, "node_modules"), 
              path.resolve(__dirname, "dist")
          ]
      }
    ]
  }
}
