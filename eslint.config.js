// ESLint flat config (mínimo) — TypeScript estrito no motor e shared.
import tseslint from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
  { ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.turbo/**"] },
  {
    files: ["packages/**/*.ts"],
    languageOptions: { parser, parserOptions: { sourceType: "module" } },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
