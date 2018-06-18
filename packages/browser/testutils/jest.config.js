module.exports = {
  "transform": {
    "\\.(ts|tsx)$": "test-js"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "setupTestFrameworkScriptFile": "<rootDir>/dist/__tests__/APITestUtils.js",
  "modulePathIgnorePatterns":  [".d.ts", "APITestUtils.*"],
  "moduleFileExtensions": ["js", "jsx", "json", "ts", "tsx"]
}
