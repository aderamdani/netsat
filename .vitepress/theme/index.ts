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
import QuizBox from './components/QuizBox.vue'
import TermTooltip from './components/TermTooltip.vue'
import OsiInteractive from './components/OsiInteractive.vue'
import EncapsulationDemo from './components/EncapsulationDemo.vue'
import IpHeaderInteractive from './components/IpHeaderInteractive.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('HomeHero', HomeHero)
    app.component('ModuleGrid', ModuleGrid)
    app.component('TelemetryStrip', TelemetryStrip)
    app.component('QuizBox', QuizBox)
    app.component('TermTooltip', TermTooltip)
    app.component('OsiInteractive', OsiInteractive)
    app.component('EncapsulationDemo', EncapsulationDemo)
    app.component('IpHeaderInteractive', IpHeaderInteractive)

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
