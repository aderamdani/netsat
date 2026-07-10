import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'id-ID',
  title: 'NetSat',
  description:
    'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit — dari model OSI hingga orbit geostasioner.',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['CLAUDE.md', 'README.md'],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0c111d' }],
    ['meta', { property: 'og:title', content: 'NetSat — Networking & Satelit' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Dokumentasi dan pembelajaran lengkap seputar jaringan komputer dan komunikasi satelit.',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://netsat.aderamdani.web.id' }],
  ],

  sitemap: {
    hostname: 'https://netsat.aderamdani.web.id',
  },

  themeConfig: {
    logo: { src: '/favicon.svg', width: 22, height: 22 },

    nav: [
      { text: 'Beranda', link: '/' },
      { text: 'Networking', link: '/networking/', activeMatch: '^/networking/' },
      { text: 'Satelit', link: '/satelit/', activeMatch: '^/satelit/' },
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
          ],
        },
        {
          text: 'MODUL 02 — SATELIT',
          collapsed: true,
          items: [{ text: 'Buka Modul Satelit →', link: '/satelit/' }],
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
            { text: 'VSAT', link: '/satelit/vsat' },
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

    lastUpdated: { text: 'Diperbarui' },

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
})
