/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Paket font self-hosted ini side-effect-only (langsung memuat CSS lewat
// package export), tidak menerbitkan tipe sendiri.
declare module '@fontsource-variable/inter'
declare module '@fontsource-variable/bricolage-grotesque'
