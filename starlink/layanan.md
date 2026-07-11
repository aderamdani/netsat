---
title: Jenis Layanan & Paket Starlink
---

# Jenis Layanan & Paket Starlink

SpaceX membagi layanan Starlink ke dalam beberapa kategori paket langganan. Setiap paket dirancang untuk memenuhi kebutuhan mobilitas, bandwidth, prioritas trafik, serta jenis perangkat keras yang berbeda. 

Bagi administrator jaringan di perkantoran atau site industri, memilih paket yang tepat sangat krusial untuk menjamin stabilitas koneksi dan efisiensi biaya.

---

## Tabel Perbandingan Paket Layanan Starlink

| Nama Paket | Penggunaan Utama | Mobilitas | Prioritas Data | Jenis IP WAN |
| --- | --- | --- | --- | --- |
| **Residensial** | Rumah / Kantor kecil statis | Terkunci di satu alamat | Standard (*Best Effort*) | IPv4 CGNAT |
| **Roam (Regional/Global)** | Kemah, Nomaden, Lapangan | Bisa berpindah darat | Standard (*Best Effort*) | IPv4 CGNAT |
| **Bisnis / Enterprise** | Perusahaan, Tambang, Perkebunan | Lokasi tetap / Portabel | **Priority** (Dapat jatah GB prioritasi) | **IPv4 Publik Dinamis** |
| **Maritim (Mobile Priority)** | Kapal laut, Offshore, Transportasi | Aktif saat bergerak | **Mobile Priority** (Prioritas tertinggi di laut) | **IPv4 Publik Dinamis** |
| **Aviation** | Pesawat terbang | Aktif saat terbang tinggi | Priority Khusus | IPv4 Publik Dinamis |

---

## Pembahasan Detail Paket Layanan

### 1. Residensial — Konektivitas Statis Ekonomis
Paket dasar paling populer untuk pengguna rumahan atau kantor kecil di lokasi tetap.
*   **Geofence:** Alamat pengaktifan terkunci pada satu koordinat rumah. Jika perangkat dipindahkan ke luar area sel (cell) terdaftar, internet akan mati.
*   **Best Effort:** Bandwidth tidak dijamin. Di jam sibuk, kecepatan download bisa menurun karena trafik dibagi dengan pengguna lain di sel yang sama.

### 2. Roam (Jelajah) — Untuk Tim Lapangan Portabel
Didesain untuk pekerja lapangan, berkemah, atau instalasi sementara yang sering berpindah tempat di darat.
*   **Fitur Pause:** Layanan bisa diaktifkan dan dinonaktifkan secara bulanan melalui portal pengguna. Sangat hemat untuk proyek lapangan berdurasi pendek.
*   **Tanpa Batasan Sel:** Antena otomatis mencari satelit di koordinat mana saja ia diletakkan (selama berada di daratan negara yang ter-cover).

### 3. Bisnis & Enterprise — Untuk Kebutuhan Korporasi
Diperuntukkan bagi infrastruktur kritis di daerah terpencil yang membutuhkan stabilitas tinggi dan alamat IP publik.
*   **Priority Data:** Akun mendapatkan jatah kuota prioritas (misalnya $40\text{ GB}$, $1\text{ TB}$, atau $2\text{ TB}$ per bulan). Selama kuota ini aktif, data pengguna akan diprioritaskan di atas semua pengguna residensial di wilayah tersebut, menghasilkan kecepatan unduh hingga **$220\text{ Mbps}$** yang lebih stabil.
*   **Alokasi IP Publik:** Mendapatkan IP publik IPv4 asli (dinamis) secara gratis. Sangat berguna untuk:
    *   Konfigurasi VPN Site-to-Site langsung (IPsec/WireGuard) tanpa VPS perantara.
    *   Melakukan pemantauan CCTV secara langsung dari luar.

### 4. Maritim (Mobile Priority) — Penakluk Samudra
Paket khusus untuk transportasi laut, kapal niaga, yacht, dan anjungan minyak lepas pantai (*offshore rig*).
*   **Konektivitas di Laut Lepas:** Akses internet tetap aktif bahkan saat berada ratusan mil di luar batas perairan teritorial negara.
*   **In-Motion Usage:** Diizinkan beroperasi saat kapal sedang melaju kencang dan menghadapi ombak besar (wajib menggunakan perangkat keras *Flat High Performance*).

---

## Teknologi Masa Depan: Direct to Cell

SpaceX sedang mengembangkan dan mulai menguji teknologi **Direct to Cell** (Komunikasi Satelit ke Ponsel Biasa):

*   **Tanpa Alat Tambahan:** Teknologi ini tidak memerlukan antena Starlink maupun HP khusus satelit. Ponsel pintar standar yang mendukung koneksi LTE biasa bisa terhubung langsung ke satelit Starlink di luar angkasa.
*   **Fungsi Utama:**
    *   **Pesan Singkat (SMS):** Untuk komunikasi darurat di area blank spot total tanpa sinyal seluler bumi.
    *   **Suara & Data (Masa Depan):** Mengirimkan data internet ringan langsung ke HP pengguna di tengah hutan atau gunung.
*   **Cara Kerja:** Satelit Starlink generasi terbaru dilengkapi modul antena pemancar seluler khusus yang bertindak layaknya "tower BTS seluler terbang" di luar angkasa.

---

## Cek Pemahaman

1.  Apa keuntungan utama dari paket Starlink *Bisnis/Enterprise* dibanding paket *Residensial* dari sudut pandang administrator jaringan kantor cabang?
    <br>→ Paket Bisnis/Enterprise mendapatkan prioritas trafik data (*Priority Data*) di atas trafik pengguna umum, sehingga menjamin throughput yang lebih stabil. Selain itu, paket ini mendapatkan alamat IP publik IPv4 dinamis yang mempermudah konfigurasi VPN dan remote akses secara langsung.
2.  Apakah antena Starlink tipe *Standard Actuated* (paket Residensial Gen 2) boleh digunakan untuk internetan aktif di atas kapal yang sedang berlayar di laut lepas?
    <br>→ Tidak boleh. Menggunakan antena tipe standard actuated dalam kondisi bergerak (*in-motion*) melanggar aturan lisensi Starlink dan motor mekanisnya rawan rusak akibat beban dinamis goyangan ombak. Untuk maritim wajib menggunakan tipe *Flat High Performance* dengan paket *Mobile Priority*.
3.  Bagaimana teknologi *Direct to Cell* milik Starlink bekerja melayani pengguna ponsel pintar standar?
    <br>→ Satelit Starlink bertindak sebagai tower BTS seluler terbang di orbit rendah bumi, memancarkan sinyal frekuensi LTE standar yang dapat ditangkap langsung oleh kartu SIM dan antena internal ponsel pintar biasa tanpa memerlukan modem atau adapter satelit tambahan.
