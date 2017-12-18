var babelConfig = require('./babel.config')

module.exports = require('babel-7-jest').createTransformer(babelConfig)