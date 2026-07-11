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
import TerminalSimulator from './components/TerminalSimulator.vue'
import SubnetWidget from './components/SubnetWidget.vue'
import PacketTracerMini from './components/PacketTracerMini.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('HomeHero', HomeHero)
    app.component('ModuleGrid', ModuleGrid)
    app.component('TelemetryStrip', TelemetryStrip)
    app.component('TerminalSimulator', TerminalSimulator)
    app.component('SubnetWidget', SubnetWidget)
    app.component('PacketTracerMini', PacketTracerMini)

    // View Transitions API
    if (typeof window !== 'undefined' && 'startViewTransition' in document) {
      let resolveTransition: (() => void) | null = null

      router.onBeforeRouteChange = () => {
        // Prevent overlapping transitions
        if (resolveTransition) return
        
        const transition = document.startViewTransition(() => {
          return new Promise(resolve => {
            resolveTransition = resolve
          })
        })
      }

      router.onAfterRouteChanged = () => {
        if (resolveTransition) {
          setTimeout(() => {
            resolveTransition!()
            resolveTransition = null
          }, 50) // Small delay to ensure DOM is updated
        }
      }
    }
  },
} satisfies Theme
