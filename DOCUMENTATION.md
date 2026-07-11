# Dokumentasi Teknis NetSat

NetSat adalah platform pembelajaran dan dokumentasi terbuka yang menggabungkan dua topik utama: **Jaringan Komputer (Networking)** dan **Komunikasi Satelit**, lengkap dengan modul praktik menggunakan **MikroTik RouterOS**.

Situs ini dibangun menggunakan **VitePress** dengan tema kustom bernuansa *"telemetri stasiun bumi"* dan ditulis sepenuhnya dalam Bahasa Indonesia.

---

## 📂 Struktur Direktori Proyek

Berikut adalah gambaran umum dari pohon direktori proyek NetSat:

```text
netsat/
├── .vitepress/             # Konfigurasi VitePress dan Kustomisasi Tema
│   ├── components/         # Komponen Vue kustom untuk beranda
│   │   ├── HomeHero.vue    # Visualisasi orbit interaktif & hero section
│   │   ├── ModuleGrid.vue  # Grid kartu modul & daftar topik
│   │   └── TelemetryStrip.vue # Baris data metrik kunci (telemetri)
│   ├── config.ts           # Konfigurasi utama VitePress (nav, sidebar, head)
│   ├── custom.css          # Tema CSS kustom (stasiun bumi: indigo & emas)
│   └── index.ts            # Entry point pendaftaran tema kustom & komponen
├── networking/             # Modul 01 — Jaringan Komputer (Markdown)
│   ├── index.md            # Pengantar Jaringan
│   ├── model-osi.md        # Penjelasan Lapisan OSI
│   ├── model-tcp-ip.md     # Penjelasan Arsitektur TCP/IP
│   ├── subnetting.md       # IP Addressing & Subnetting
│   ├── routing.md          # Konsep Routing
│   ├── switching.md        # Switching & VLAN
│   ├── protokol.md         # Protokol Jaringan (HTTP, DNS, DHCP, dll.)
│   ├── keamanan.md         # Dasar Keamanan Jaringan
│   ├── firewall.md         # Panduan Lengkap Firewall (IPTables/RouterOS)
│   └── keamanan-lanjut.md  # Keamanan Jaringan Lanjutan
├── satelit/                # Modul 02 — Komunikasi Satelit (Markdown)
│   ├── index.md            # Pengantar Komunikasi Satelit
│   ├── orbit.md            # Orbit Satelit (LEO, MEO, GEO)
│   ├── komunikasi.md       # Prinsip Transmisi (Link Budget, Modulasi, Latensi)
│   ├── ground-station.md   # Infrastruktur Stasiun Bumi / Hub
│   ├── frekuensi-band.md   # Alokasi Frekuensi (C-band, Ku-band, Ka-band)
│   ├── vsat.md             # Teknologi VSAT (Very Small Aperture Terminal)
│   └── vsat-lanjut.md      # Operasional & Perencanaan VSAT Lanjutan
├── mikrotik/               # Modul 03 — Praktik MikroTik RouterOS (Markdown)
│   ├── index.md            # Pengantar RouterOS & WinBox
│   ├── akses-awal.md       # Konfigurasi Awal & Hardening Perangkat
│   ├── manajemen.md        # Manajemen Pengguna & Berkas
│   ├── interface-ip.md     # Konfigurasi Interface & IP Address
│   ├── bridging-switching.md # Konfigurasi Bridge & Switch Chip
│   ├── dhcp-dns-nat.md     # Layanan DHCP Server, DNS, dan NAT
│   ├── routing.md          # Static Routing & Dynamic Routing
│   ├── firewall-qos.md     # Filter Rules, Raw, Mangle, & Simple Queue
│   ├── pppoe.md            # PPPoE Server & Client
│   ├── vpn.md              # VPN (L2TP, OVPN, SSTP, WireGuard)
│   ├── wireless-dan-satelit.md # Konfigurasi Wireless & Optimasi Link Satelit
│   ├── monitoring.md       # Monitoring Bandwidth & Logging (Netwatch/Graphing)
│   └── glosari.md          # Glosari Istilah Jaringan & Satelit
├── starlink/                # Modul 04 — Ekosistem Starlink (Markdown)
│   ├── index.md            # Pengantar Starlink
│   ├── arsitektur.md       # Arsitektur Jaringan (Laser ISL, Gateway, POP)
│   ├── hardware.md         # Spesifikasi Hardware & Catu Daya PoE
│   ├── layanan.md          # Jenis Layanan (Residensial, Roam, Bisnis, Maritim)
│   ├── praktik-mikrotik.md # Konfigurasi Praktis RouterOS untuk Starlink
│   └── troubleshooting.md  # Troubleshooting, Hambatan Sinyal, & Diagnostik
├── public/                 # Aset statis (ikon, logo, favicon, gambar)
├── package.json            # Daftar dependensi dan script build
└── vercel.json             # Konfigurasi deployment untuk Vercel
```

---

## 🛠️ Teknologi & Dependensi Utama

Aplikasi ini berjalan di atas teknologi modern dengan dependensi minimal untuk memastikan kecepatan pemuatan (Fast Load) dan efisiensi token:
*   **VitePress (v1.6.4)**: Generator situs statis berbasis Vite dan Vue 3. Sangat cepat karena melakukan pra-render halaman menjadi HTML statis dan melakukan hidrasi menjadi Single Page Application (SPA) setelah dimuat.
*   **Vue 3**: Digunakan untuk menulis komponen dinamis seperti visualisasi orbit.
*   **@lucide/vue**: Set ikon SVG (Lucide) yang diimpor secara modular untuk meminimalkan ukuran bundel.
*   **Google Fonts (Self-hosted via Fontsource)**:
    *   `Bricolage Grotesque`: Digunakan untuk elemen judul/display (`h1`, `h2`, `h3`).
    *   `Inter`: Digunakan sebagai font tulisan utama (body text) agar nyaman dibaca.
    *   `IBM Plex Mono`: Digunakan untuk data telemetri, tabel, dan blok kode.

---

## 🎨 Sistem Desain & Antarmuka (Aestetika Telemetri)

Tema visual NetSat dirancang kustom pada berkas `file:///Users/aderamdani/Developer/netsat/.vitepress/theme/custom.css` dengan konsep **Telemetri Stasiun Bumi**.

### 1. Palet Warna (Emas MLI & Deep-Space Indigo)
Desain ini menghindari warna standar bawaan untuk memberikan impresi premium:
*   **Mode Terang (Light Mode)**: Menggunakan warna kertas hangat netral (`#fbfaf7`) sebagai background, bukan putih steril, dikombinasikan dengan teks berwarna ink/tinta gelap (`#10161f`).
*   **Mode Gelap (Dark Mode)**: Menggunakan warna indigo angkasa luar (`#0c111d`), dikombinasikan dengan teks abu-abu terang hangat (`#e8e6df`).
*   **Warna Aksen**: Menggunakan warna emas foil isolasi satelit / Multi-Layer Insulation (MLI):
    *   Terang: `#9a6700` (Emas redup)
    *   Gelap: `#e3b35e` (Emas menyala)

### 2. Tipografi & Ornamen Kustom
*   **Garis Telemetri H2**: Setiap elemen judul `<h2>` di dalam artikel memiliki ornamen garis horizontal emas pendek di atasnya (menggunakan pseudo-element `h2::before`) sebagai pengganti garis pembatas penuh tradisional.
*   **Sidebar Active State**: Menu sidebar yang sedang aktif ditandai dengan titik sinyal emas kecil di sebelah kiri teks.
*   **Custom Block**: Kotak info (tip, warning, dll.) memiliki sudut tumpul (`border-radius: 6px`) dengan garis batas kiri emas khas NetSat.

---

## 📦 Komponen Kustom Vue

Untuk membuat beranda terasa hidup dan interaktif, kami membangun 3 komponen kustom:

### 1. `HomeHero.vue` (Visualisasi Orbit Bumi)
Komponen ini menampilkan judul besar, deskripsi, tombol aksi, dan sebuah **Visualisasi Orbit Interaktif** menggunakan SVG dan animasi CSS murni:
*   Menampilkan bumi di tengah dikelilingi oleh 3 lintasan orbit konsentris: **LEO** (Low Earth Orbit), **MEO** (Medium Earth Orbit), dan **GEO** (Geostationary Earth Orbit - digambarkan dengan garis putus-putus).
*   Satelit di setiap orbit berputar dengan kecepatan yang disesuaikan dengan fisika orbital nyata (semakin dekat ke bumi, semakin cepat):
    *   **LEO**: Berputar penuh setiap **14 detik**.
    *   **MEO**: Berputar penuh setiap **34 detik**.
    *   **GEO**: Berputar penuh setiap **80s** (simulasi rotasi sinkron).
*   Mendukung penyesuaian aksesibilitas: animasi otomatis mati jika pengguna mengaktifkan preferensi `prefers-reduced-motion`.

### 2. `TelemetryStrip.vue` (Informasi Telemetri Kunci)
Baris informasi ringkas yang diletakkan tepat di bawah hero beranda untuk menyajikan angka-angka ikonik dalam dunia jaringan dan satelit secara cepat:
*   **Lapisan OSI**: 7
*   **Alamat IPv4**: $2^{32}$
*   **Altitude GEO**: 35.786 km
*   **Latensi GEO (RTT)**: $\approx$ 500 ms
*   **Kecepatan Orbit LEO**: $\approx$ 7,8 km/s
*   **Band Ku Uplink**: 14 GHz

### 3. `ModuleGrid.vue` (Peta Modul)
Grid navigasi responsif 3-kolom (yang akan menjadi 1-kolom di layar ponsel) untuk membagi modul utama:
*   Setiap kartu modul memiliki deskripsi singkat, daftar 6 topik terpenting lengkap dengan ikon Lucide yang relevan, dan tautan langsung untuk membaca modul.
*   Terdapat efek transisi halus saat pointer mouse melayang (*hover*) di atas daftar topik.

---

## ⚙️ Konfigurasi Utama (`.vitepress/config.ts`)

Seluruh pengaturan navigasi, metadata SEO, pencarian, dan tautan diatur secara terpusat pada file `file:///Users/aderamdani/Developer/netsat/.vitepress/config.ts`. Beberapa konfigurasi penting meliputi:

*   **SEO Metadata**: Konfigurasi tag `<head>` lengkap termasuk Open Graph (`og:image`, `og:description`) dan Twitter Cards untuk optimalisasi pembagian tautan di media sosial.
*   **Clean URLs**: Mengaktifkan `cleanUrls: true` sehingga alamat halaman tidak menampilkan ekstensi `.html` (misal `/networking/routing` bukan `/networking/routing.html`).
*   **Search Lokal**: Menggunakan mesin pencari internal bawaan VitePress (`provider: 'local'`) yang disesuaikan ke Bahasa Indonesia:
    ```typescript
    translations: {
      button: { buttonText: 'Cari materi' },
      modal: {
        noResultsText: 'Tidak ada hasil untuk',
        // ...
      }
    }
    ```
*   **Struktur Sidebar Terintegrasi**: Sidebar dirancang agar dinamis tergantung pada modul yang sedang dibuka. Saat berada di modul *Satelit*, sidebar *Networking* dan *MikroTik* akan dikolaps secara otomatis untuk menghemat ruang baca.

---

## 💻 Pengembangan Lokal & Perintah

Pastikan Anda telah menginstal [Node.js](https://nodejs.org) dan pengelola paket `pnpm` di sistem Anda.

### Alur Kerja Pengembangan:

1.  **Instalasi Dependensi**:
    ```bash
    pnpm install
    ```
    *Catatan: File lock menggunakan `pnpm-lock.yaml` untuk mengunci versi dependensi.*

2.  **Menjalankan Server Dev**:
    ```bash
    pnpm dev
    ```
    Perintah ini akan menjalankan server pengembangan lokal yang mendukung *Hot Module Replacement (HMR)* di alamat `http://localhost:5173`.

3.  **Membangun Proyek (Production Build)**:
    ```bash
    pnpm build
    ```
    VitePress akan mengompilasi semua file markdown dan aset Vue menjadi halaman HTML statis yang dioptimalkan di dalam folder `.vitepress/dist`.

4.  **Pratinjau Hasil Build**:
    ```bash
    pnpm preview
    ```
    Menjalankan server lokal untuk menguji performa dan kesesuaian hasil build produksi sebelum diunggah ke hosting.

---

## 🚀 Deployment (Vercel)

NetSat di-deploy secara otomatis ke platform **Vercel** melalui integrasi GitHub. Konfigurasi deployment disimpan pada `file:///Users/aderamdani/Developer/netsat/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": ".vitepress/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "cleanUrls": true,
  "trailingSlash": false
}
```

Setiap kali ada perubahan kode yang di-*push* ke repositori utama, Vercel akan otomatis menjalankan proses instalasi bersih (`pnpm install --frozen-lockfile`), melakukan kompilasi (`pnpm build`), dan mempublikasikan hasilnya ke domain produksi [netsat.aderamdani.web.id](https://netsat.aderamdani.web.id).

---

## ✍️ Panduan Menulis & Kontribusi Konten

Bagi kontributor yang ingin menambahkan materi atau memperbaiki kesalahan (typo):

1.  **Format Berkas**:
    Semua materi ditulis menggunakan Markdown standar (`.md`).
2.  **Konvensi Penulisan**:
    *   Gunakan format huruf miring (*italic*) untuk istilah teknis bahasa Inggris yang belum diserap (misalnya: *three-way handshake*, *throughput*).
    *   Gunakan blok kode dengan penyorot sintaksis yang sesuai:
        ```text
        ```routeros
        /ip address add address=192.0.2.1/24 interface=ether1
        ```
        ```
    *   Jika ingin membuat blok tips/catatan kustom:
        ```markdown
        ::: tip Info Telemetri
        Latensi satu arah (one-way delay) ke satelit GEO berkisar 250 ms.
        :::
        ```
3.  **Peta Alamat IP untuk Contoh**:
    Selalu gunakan alamat dokumentasi resmi sesuai standar RFC 5737 untuk keamanan:
    *   `192.0.2.0/24` (TEST-NET-1)
    *   `198.51.100.0/24` (TEST-NET-2)
    *   `203.0.113.0/24` (TEST-NET-3)
