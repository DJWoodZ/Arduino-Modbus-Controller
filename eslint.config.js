// eslint.config.js
import { default as vuetifyConfig } from 'eslint-config-vuetify';

export default [
  ...vuetifyConfig,
  {
    ignores: ['*.d.ts'],
  },
  {
    languageOptions: {
      globals: {
        '__COMMIT_HASH__': true,
      },
    },
  },
  {
    rules: {
      'semi': 'error',
    },
  },
];
