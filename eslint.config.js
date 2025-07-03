// ESLint flat config (v9) for dark-sticky-notes Electron app
// Three separate environments:
//   - main.js: Node.js CommonJS (main process)
//   - preload.js: Node.js CommonJS + Electron contextBridge
//   - renderer.js: Browser globals (renderer process, no Node access)

"use strict";

module.exports = [
  // ── Main process + preload (Node.js CommonJS) ─────────────────────────────
  {
    files: ["main.js", "preload.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        exports: "writable",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Error prevention
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "error",

      // Code quality
      "eqeqeq": ["error", "always"],
      "no-implicit-globals": "error",
      "no-eval": "error",
      "no-new-func": "error",

      // Console — allow error/warn, flag bare log
      "no-console": ["warn", { "allow": ["error", "warn"] }],

      // Style (matching existing project conventions)
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }],
    },
  },

  // ── Renderer process (browser environment, no Node) ───────────────────────
  {
    files: ["renderer.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        alert: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-console": ["warn", { "allow": ["error", "warn"] }],
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }],
    },
  },
];
