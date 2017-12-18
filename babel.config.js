/*global __dirname, module*/

module.exports = {
  "presets": [
    ["@babel/env", {
      "targets": {
        "browsers": ["last 2 versions", "ie 10"],
        "node": "6"
      },
      "useBuiltins": "usage",
    }]
  ],
  "plugins": [
    "transform-async-to-generator",
    
    "syntax-flow",
    
    "@babel/plugin-proposal-decorators",
    "@babel/transform-flow-strip-types",
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],

    "version-transform",
    ["babel-plugin-transform-builtin-extend", { globals: ["Error"] }]
  ]
}
