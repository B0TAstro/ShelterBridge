// ESLint 9 "flat config". Lints the React + TypeScript frontend only.
// The Rust side (src-tauri) is handled by clippy, not ESLint.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Paths ESLint should never look at.
  { ignores: ["dist", "node_modules", "src-tauri/target"] },

  // Base JS + TypeScript recommended rules.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React-specific rules for our source files.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Must stay LAST: turns off ESLint rules that would fight Prettier.
  prettier,
);
