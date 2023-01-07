module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  "ignorePatterns": [".eslintrc.cjs"],
  plugins: ['@typescript-eslint'],
  root: true,
  "rules": {
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/array-type": ["warn", {default: "generic"}],
    "@typescript-eslint/no-base-to-string": "warn",
    "@typescript-eslint/no-unnecessary-condition": "warn"
  }
};
