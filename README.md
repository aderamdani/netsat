# NetSat

**Dokumentasi & pembelajaran networking dan komunikasi satelit, dalam bahasa Indonesia.**

🌐 **Live**: [netsat.aderamdani.web.id](https://netsat.aderamdani.web.id)

Dua modul yang saling bertaut:

- **Networking** — pengantar jaringan, model OSI, TCP/IP, IP addressing & subnetting, routing, switching & VLAN, protokol, keamanan jaringan.
- **Satelit** — pengantar satelit, orbit LEO/MEO/GEO, komunikasi satelit (link budget, modulasi, latensi), ground station, frekuensi & band, VSAT.

## Teknologi

- [VitePress](https://vitepress.dev) + tema kustom "telemetri stasiun bumi" (dark/light, search lokal, responsif)
- [Lucide](https://lucide.dev) via `@lucide/vue`
- Font self-hosted: Bricolage Grotesque, Inter, IBM Plex Mono
- Deploy otomatis ke [Vercel](https://vercel.com)

## Pengembangan lokal

```bash
pnpm install
pnpm dev       # server dev di http://localhost:5173
pnpm build     # build produksi ke .vitepress/dist
pnpm preview   # pratinjau hasil build
```

## Kontribusi

Menemukan kesalahan materi atau typo? Silakan buka *issue* atau *pull request*.

## Lisensi

MIT © Ade Ramdani
