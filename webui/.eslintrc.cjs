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
      ignoreExports: [
        'typescript/main/index.ts',
        'typescript/main/worker.ts',
        'typescript/langs/langs.ts',
        'typescript/myanimelist/myanimelist.ts',
      ]
    }],
    "import/namespace": ['warn', { allowComputed: true }],
    "no-magic-numbers": ["warn", {
      ignoreArrayIndexes: true,
      // why not use these comments as constants? because it will never change
      ignore: [
        0, 1, 2, 3,     // indexing rgba values
        4,              // rgba has 4 values
        16,             // base 16
        -1,             // findIndex failure
        255,            // max 8 bit number
        180, 360,       // special angles in degrees
        12, 0.7, -0.7,  // example numbers with no particular meaning
        100,            // highest value in a percentage
        10,             // rounding 1dp
        -100,           // range for election
        -2,             // range for grid
      ]
    }],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" } ]
  }
};
