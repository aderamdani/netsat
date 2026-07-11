import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import './custom.css'

import Layout from './Layout.vue'

import HomeHero from './components/HomeHero.vue'
import ModuleGrid from './components/ModuleGrid.vue'
import TelemetryStrip from './components/TelemetryStrip.vue'
import QuizBox from './components/QuizBox.vue'
import TermTooltip from './components/TermTooltip.vue'
import OsiInteractive from './components/OsiInteractive.vue'
import EncapsulationDemo from './components/EncapsulationDemo.vue'
import IpHeaderInteractive from './components/IpHeaderInteractive.vue'
import TcpInteractiveDemo from './components/TcpInteractiveDemo.vue'

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app, router }) {
    app.component('HomeHero', HomeHero)
    app.component('ModuleGrid', ModuleGrid)
    app.component('TelemetryStrip', TelemetryStrip)
    app.component('QuizBox', QuizBox)
    app.component('TermTooltip', TermTooltip)
    app.component('OsiInteractive', OsiInteractive)
    app.component('EncapsulationDemo', EncapsulationDemo)
    app.component('IpHeaderInteractive', IpHeaderInteractive)
    app.component('TcpInteractiveDemo', TcpInteractiveDemo)

    // View Transitions API
    if (typeof window !== 'undefined' && 'startViewTransition' in document) {
      let resolveTransition: (() => void) | null = null

      router.onBeforeRouteChange = () => {
        // Prevent overlapping transitions
        if (resolveTransition) return

        const transition = document.startViewTransition(() => {
          return new Promise<void>((resolve) => {
            resolveTransition = resolve
            // pengaman: kalau onAfterRouteChanged tak pernah menembak
            // (navigasi dibatalkan/hard reload), jangan biarkan callback
            // menggantung sampai Chrome meng-abort transisi
            setTimeout(() => {
              if (resolveTransition) {
                resolveTransition()
                resolveTransition = null
              }
            }, 1000)
          })
        })
        // transisi yang dibatalkan (navigasi cepat/keras) me-reject promise;
        // tanpa catch, ini jadi uncaught error di console
        transition.ready.catch(() => {})
        transition.finished.catch(() => {})
        transition.updateCallbackDone.catch(() => {})
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
