import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  lang: 'id-ID',
  title: 'NetSat',
  description:
    'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit — dari model OSI hingga orbit geostasioner.',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['CLAUDE.md', 'README.md', 'DOCUMENTATION.md'],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#0B0E14' }],
    [
      'meta',
      {
        name: 'description',
        content:
          'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit dalam bahasa Indonesia — dari model OSI, subnetting, dan routing hingga orbit LEO/MEO/GEO, ground station, dan VSAT.',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'NetSat' }],
    ['meta', { property: 'og:title', content: 'NetSat — Networking & Satelit' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit dalam bahasa Indonesia.',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://netsat.aderamdani.web.id' }],
    ['meta', { property: 'og:image', content: 'https://netsat.aderamdani.web.id/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:locale', content: 'id_ID' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'NetSat — Networking & Satelit' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit dalam bahasa Indonesia.',
      },
    ],
    ['meta', { name: 'twitter:image', content: 'https://netsat.aderamdani.web.id/og-image.png' }],
  ],

  vite: {
    server: { hmr: { overlay: false } },
    build: { chunkSizeWarningLimit: 1600 },
    // interop CJS dependensi mermaid saat `vitepress dev`
    optimizeDeps: { include: ['mermaid', 'dayjs', '@braintree/sanitize-url', 'debug', 'cytoscape', 'cytoscape-cose-bilkent'] },
  },

  markdown: {
    languageAlias: { routeros: 'bash' },
  },

  sitemap: {
    hostname: 'https://netsat.aderamdani.web.id',
  },

  themeConfig: {
    logo: { src: '/favicon.svg', width: 22, height: 22 },

    nav: [
      { text: 'Beranda', link: '/' },
      { text: 'Networking', link: '/networking/', activeMatch: '^/networking/' },
      { text: 'Satelit', link: '/satelit/', activeMatch: '^/satelit/' },
      { text: 'MikroTik', link: '/mikrotik/', activeMatch: '^/mikrotik/' },
      { text: 'Starlink', link: '/starlink/', activeMatch: '^/starlink/' },
      { text: 'Tentang', link: '/tentang' },
    ],

    sidebar: {
      '/networking/': [
        {
          text: 'MODUL 01 — NETWORKING',
          items: [
            { text: 'Pengantar Jaringan', link: '/networking/' },
            { text: 'Model OSI', link: '/networking/model-osi' },
            { text: 'Model TCP/IP', link: '/networking/model-tcp-ip' },
            { text: 'IP Addressing & Subnetting', link: '/networking/subnetting' },
            { text: 'Routing', link: '/networking/routing' },
            { text: 'Switching & VLAN', link: '/networking/switching' },
            { text: 'Protokol Jaringan', link: '/networking/protokol' },
            { text: 'Keamanan Jaringan', link: '/networking/keamanan' },
            { text: 'Firewall — Panduan Lengkap', link: '/networking/firewall' },
            { text: 'Keamanan Lanjutan', link: '/networking/keamanan-lanjut' },
          ],
        },
        {
          text: 'MODUL 02 — SATELIT',
          collapsed: true,
          items: [{ text: 'Buka Modul Satelit →', link: '/satelit/' }],
        },
        {
          text: 'MODUL 03 — MIKROTIK',
          collapsed: true,
          items: [{ text: 'Buka Modul MikroTik →', link: '/mikrotik/' }],
        },
        {
          text: 'MODUL 04 — STARLINK',
          collapsed: true,
          items: [{ text: 'Buka Modul Starlink →', link: '/starlink/' }],
        },
      ],
      '/satelit/': [
        {
          text: 'MODUL 01 — NETWORKING',
          collapsed: true,
          items: [{ text: 'Buka Modul Networking →', link: '/networking/' }],
        },
        {
          text: 'MODUL 02 — SATELIT',
          items: [
            { text: 'Pengantar Satelit', link: '/satelit/' },
            { text: 'Orbit: LEO, MEO, GEO', link: '/satelit/orbit' },
            { text: 'Komunikasi Satelit', link: '/satelit/komunikasi' },
            { text: 'Ground Station', link: '/satelit/ground-station' },
            { text: 'Frekuensi & Band', link: '/satelit/frekuensi-band' },
            { text: 'Simulasi Link Budget', link: '/satelit/link-budget' },
            { text: 'LEO vs VSAT vs Starlink', link: '/satelit/leo-vsat-starlink' },
            { text: 'VSAT', link: '/satelit/vsat' },
            { text: 'VSAT — Operasional & Perencanaan', link: '/satelit/vsat-lanjut' },
          ],
        },
        {
          text: 'MODUL 03 — MIKROTIK',
          collapsed: true,
          items: [{ text: 'Buka Modul MikroTik →', link: '/mikrotik/' }],
        },
        {
          text: 'MODUL 04 — STARLINK',
          collapsed: true,
          items: [{ text: 'Buka Modul Starlink →', link: '/starlink/' }],
        },
      ],
      '/mikrotik/': [
        {
          text: 'MODUL 01 — NETWORKING',
          collapsed: true,
          items: [{ text: 'Buka Modul Networking →', link: '/networking/' }],
        },
        {
          text: 'MODUL 02 — SATELIT',
          collapsed: true,
          items: [{ text: 'Buka Modul Satelit →', link: '/satelit/' }],
        },
        {
          text: 'MODUL 03 — MIKROTIK',
          items: [
            { text: 'Pengantar RouterOS', link: '/mikrotik/' },
            { text: 'Akses Awal', link: '/mikrotik/akses-awal' },
            { text: 'Manajemen Perangkat', link: '/mikrotik/manajemen' },
            { text: 'Interface & IP Address', link: '/mikrotik/interface-ip' },
            { text: 'IPv6 di RouterOS', link: '/mikrotik/ipv6' },
            { text: 'Bridging & Switching', link: '/mikrotik/bridging-switching' },
            { text: 'DHCP, DNS & NAT', link: '/mikrotik/dhcp-dns-nat' },
            { text: 'Routing di RouterOS', link: '/mikrotik/routing' },
            { text: 'Firewall & QoS', link: '/mikrotik/firewall-qos' },
            { text: 'PPPoE', link: '/mikrotik/pppoe' },
            { text: 'VPN', link: '/mikrotik/vpn' },
            { text: 'Wireless & Satelit', link: '/mikrotik/wireless-dan-satelit' },
            { text: 'Failover & Multi-WAN Satelit', link: '/mikrotik/multi-wan' },
            { text: 'Optimasi VPN & MTU/MSS', link: '/mikrotik/vpn-optimization' },
            { text: 'QoS Dinamis', link: '/mikrotik/dynamic-qos' },
            { text: 'Operasi & Monitoring', link: '/mikrotik/monitoring' },
            { text: 'Scripting & Otomatisasi', link: '/mikrotik/scripting-otomatisasi' },
            { text: 'Glosari', link: '/mikrotik/glosari' },
          ],
        },
        {
          text: 'MODUL 04 — STARLINK',
          collapsed: true,
          items: [{ text: 'Buka Modul Starlink →', link: '/starlink/' }],
        },
      ],
      '/starlink/': [
        {
          text: 'MODUL 01 — NETWORKING',
          collapsed: true,
          items: [{ text: 'Buka Modul Networking →', link: '/networking/' }],
        },
        {
          text: 'MODUL 02 — SATELIT',
          collapsed: true,
          items: [{ text: 'Buka Modul Satelit →', link: '/satelit/' }],
        },
        {
          text: 'MODUL 03 — MIKROTIK',
          collapsed: true,
          items: [{ text: 'Buka Modul MikroTik →', link: '/mikrotik/' }],
        },
        {
          text: 'MODUL 04 — STARLINK',
          items: [
            { text: 'Pengantar Starlink', link: '/starlink/' },
            { text: 'Arsitektur Jaringan', link: '/starlink/arsitektur' },
            { text: 'Perangkat Keras', link: '/starlink/hardware' },
            { text: 'Jenis Layanan & Paket', link: '/starlink/layanan' },
            { text: 'Praktik Integrasi RouterOS', link: '/starlink/praktik-mikrotik' },
            { text: 'Troubleshooting & Diagnostik', link: '/starlink/troubleshooting' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Cari materi', buttonAriaLabel: 'Cari materi' },
          modal: {
            displayDetails: 'Tampilkan detail',
            resetButtonTitle: 'Hapus pencarian',
            backButtonTitle: 'Kembali',
            noResultsText: 'Tidak ada hasil untuk',
            footer: {
              selectText: 'pilih',
              navigateText: 'navigasi',
              closeText: 'tutup',
            },
          },
        },
      },
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/aderamdani/netsat' }],

    outline: { label: 'Di halaman ini', level: [2, 3] },

    docFooter: { prev: 'Sebelumnya', next: 'Selanjutnya' },

    lastUpdated: {
      text: 'Diperbarui',
      formatOptions: {
        dateStyle: 'long',
        timeStyle: 'short',
        forceLocale: true,
      },
    },

    darkModeSwitchLabel: 'Tampilan',
    lightModeSwitchTitle: 'Ganti ke mode terang',
    darkModeSwitchTitle: 'Ganti ke mode gelap',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Kembali ke atas',
    externalLinkIcon: true,

    footer: {
      message: 'Dibangun dengan VitePress. Konten bebas dipakai untuk belajar.',
      copyright: '© 2026 Ade Ramdani — NetSat',
    },
  },
}))
