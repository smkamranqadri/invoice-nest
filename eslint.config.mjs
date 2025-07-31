import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'dist/',
      'build/',
      '*.d.ts',
      'public/sw.js',
      'public/workbox-*.js',
      '.env*',
      '*.log',
      'coverage/',
      '.nyc_output',
      '.cache',
      '.parcel-cache',
      '.nuxt',
      '.vuepress/dist',
      '.serverless',
      '.fusebox/',
      '.dynamodb/',
      '.tern-port',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Let Prettier handle formatting
      'prettier/prettier': 'off',
      // Use single quotes
      quotes: ['error', 'single'],
      // Allow trailing commas
      'comma-dangle': ['error', 'always-multiline'],
      // Allow semicolons
      semi: ['error', 'always'],
      // Disable overly strict rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];

export default eslintConfig;
