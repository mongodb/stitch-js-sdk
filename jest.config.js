module.exports = {
  verbose: true,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.cjs.json',
    },
    'window': {}
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '/test/.*\\.test\\.ts$',
  testURL: 'http://localhost/',
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: null,
}
