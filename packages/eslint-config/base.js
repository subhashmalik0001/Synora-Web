const { resolve } = require("node:path");

/** @type {import("eslint").Linter.Config} */
module.exports = {
    parser: "@typescript-eslint/parser",
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    plugins: ["@typescript-eslint", "import"],
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "import/order": ["warn", { "newlines-between": "always" }],
    },
    ignorePatterns: ["node_modules/", "dist/", ".next/", ".turbo/"],
};
