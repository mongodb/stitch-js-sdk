module.exports = {
  "transform": {
    "\\.(ts|tsx)$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "setupTestFrameworkScriptFile": "<rootDir>/src/__tests__/APITestUtils.ts",
  "modulePathIgnorePatterns":  [".d.ts", "APITestUtils.*"],
  "moduleFileExtensions": ["js", "jsx", "json", "ts", "tsx"]
}
