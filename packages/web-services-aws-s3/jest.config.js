module.exports = {
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": ["js", "jsx", "json", "ts", "tsx"],
  "modulePathIgnorePatterns":  [".d.ts"],
  "transform": {
    "\\.(ts|tsx)$": "ts-jest"
  },
}
