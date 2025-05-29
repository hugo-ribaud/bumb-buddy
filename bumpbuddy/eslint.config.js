
import js from '@eslint/js';

import typescript from '@typescript-eslint/eslint-plugin';

import typescriptParser from '@typescript-eslint/parser';

import react from 'eslint-plugin-react';

import reactHooks from 'eslint-plugin-react-hooks';

import reactNative from 'eslint-plugin-react-native';



export default [

  js.configs.recommended,

  {

    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {

      parser: typescriptParser,

      parserOptions: {

        ecmaVersion: 2022,

        sourceType: 'module',

        ecmaFeatures: {

          jsx: true,

        },

      },

      globals: {

        console: 'readonly',

        process: 'readonly',

        __dirname: 'readonly',

        module: 'readonly',

        require: 'readonly',

        global: 'readonly',

      },

    },

    plugins: {

      '@typescript-eslint': typescript,

      react,

      'react-hooks': reactHooks,

      'react-native': reactNative,

    },

    rules: {

      // Basic rules

      'no-unused-vars': 'warn',

      'no-console': 'off',

      

      // TypeScript rules

      '@typescript-eslint/no-unused-vars': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',

      

      // React rules

      'react/jsx-uses-react': 'off',

      'react/react-in-jsx-scope': 'off',

      'react-hooks/rules-of-hooks': 'error',

      'react-hooks/exhaustive-deps': 'warn',

      

      // React Native rules

      'react-native/no-unused-styles': 'warn',

      'react-native/split-platform-components': 'off',

    },

    settings: {

      react: {

        version: 'detect',

      },

    },

  },

  {

    ignores: [

      'node_modules/**',

      '.expo/**',

      'dist/**',

      'build/**',

      '*.config.js',

    ],

  },

];

