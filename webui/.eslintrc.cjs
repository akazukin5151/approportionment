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
    "max-lines-per-function": ["warn", {
      max: 25,
      skipBlankLines: true,
      skipComments: true,
    }],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/array-type": ["warn", { default: "generic" }],
    "@typescript-eslint/no-base-to-string": "warn",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-unsafe-declaration-merging": "warn",
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/prefer-ts-expect-error": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/strict-boolean-expressions": ["warn", {
      allowString: false,
      allowNumber: false,
    }]
  }
};
