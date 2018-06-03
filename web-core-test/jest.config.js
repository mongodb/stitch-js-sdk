module.exports = {
  "transform": {
    "\\.(ts|tsx)$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "setupTestFrameworkScriptFile": "<rootDir>/dist/__tests__/APITestUtils.js",
  "modulePathIgnorePatterns":  [".d.ts"],
  "moduleFileExtensions": ["js", "jsx", "json", "ts", "tsx"]
}
