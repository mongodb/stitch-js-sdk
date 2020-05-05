const presets = [
  [
    '@babel/env',
    {
      targets: {
        node: true,
      },
      useBuiltIns: 'usage',
      corejs: '2.0'
    },
    '@babel/preset-react'
  ],
]

const plugins = [
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-transform-react-jsx"
];

module.exports = {presets, plugins}
