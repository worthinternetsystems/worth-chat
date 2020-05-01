module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier/@typescript-eslint",
      "plugin:prettier/recommended"
    ],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true
      },
      jsx: true,
      useJSXTextNode: true
    },
    rules: {
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/no-angle-bracket-type-assertion": "off"
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: ["@typescript-eslint"]
  };
  