/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import api from './api.js';
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'

export function registerPlugins (app) {
  app
    .use(api)
    .use(vuetify)
    .use(router)
    .use(pinia)
}
