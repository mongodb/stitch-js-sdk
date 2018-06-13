module.exports = {
  "transform": {
    "\\.(ts|tsx)$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "modulePathIgnorePatterns":  [".d.ts", "TestUtils.*"],
  "moduleFileExtensions": ["js", "jsx", "json", "ts", "tsx"]
}
