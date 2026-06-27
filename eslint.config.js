import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Diretórios/arquivos ignorados pelo lint.
  { ignores: ["dist", "legacy", "node_modules"] },

  // Regras base para o código da aplicação (TS/TSX).
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Arquivos de configuração rodam em ambiente Node.
  {
    files: ["*.{js,ts}", "vite.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Desliga regras de estilo que conflitam com o Prettier (deve ficar por último).
  prettier,
);
