import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import './custom.css'

import HomeHero from './components/HomeHero.vue'
import ModuleGrid from './components/ModuleGrid.vue'
import TelemetryStrip from './components/TelemetryStrip.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
    app.component('ModuleGrid', ModuleGrid)
    app.component('TelemetryStrip', TelemetryStrip)
  },
} satisfies Theme
