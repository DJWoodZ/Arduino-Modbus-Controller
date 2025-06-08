/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import github from '@/assets/github.svg';

// Composables
import { createVuetify } from 'vuetify';
import { aliases as defaultAliases } from 'vuetify/iconsets/mdi';

const aliases = {
  ...defaultAliases,
  ['github']: github,
};

// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: {
    aliases,
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#FFB300',
          surface: '#F8F8F8',
        },
      },
      dark: {
        colors: {
          primary: '#FFE082',
        },
      },
    },
    defaultTheme: (prefersDark ? 'dark' : 'light'),
  },
})
