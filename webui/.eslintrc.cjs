module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  "ignorePatterns": [".eslintrc.cjs"],
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      'typescript': {}
    }
  },
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
    }],
    "import/no-unused-modules": ['warn', {
      unusedExports: true,
      missingExports: true,
      ignoreExports: ['typescript/index.ts', 'typescript/worker.ts']
    }],
    "import/namespace": ['warn', { allowComputed: true }]
  }
};
