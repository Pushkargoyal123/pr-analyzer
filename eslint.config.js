// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/*.d.ts', // Ignore TypeScript declaration files
      '**/*.js', // Ignore JS files
      'dist/**', // Ignore dist folder
      'node_modules/**', // Ignore dependencies
    ],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Add custom rules here
    },
  },
];
