---
title: Jenis Layanan & Paket Starlink
---

# Jenis Layanan & Paket Starlink

SpaceX membagi layanan Starlink ke beberapa kategori paket — berbeda dalam
mobilitas, prioritas trafik, dan jenis IP WAN. Bagi administrator jaringan,
memilih paket yang tepat menentukan stabilitas koneksi dan efisiensi biaya —
mirip memilih [CIR vs contention di dunia VSAT](/satelit/vsat#merancang-layanan-parameter-yang-diperjualbelikan).

## Tabel perbandingan paket

| Nama paket | Penggunaan utama | Mobilitas | Prioritas data | Jenis IP WAN |
| --- | --- | --- | --- | --- |
| **Residensial** | Rumah / kantor kecil statis | Terkunci di satu alamat | Standard (*best effort*) | IPv4 CGNAT |
| **Roam (Regional/Global)** | Kemah, nomaden, lapangan | Bisa berpindah (darat) | Standard (*best effort*) | IPv4 CGNAT |
| **Bisnis / Enterprise** | Perusahaan, tambang, perkebunan | Lokasi tetap / portabel | **Priority** (jatah GB prioritas) | **IPv4 publik dinamis** |
| **Maritim (Mobile Priority)** | Kapal, offshore, transportasi | Aktif saat bergerak | **Mobile Priority** (tertinggi di laut) | **IPv4 publik dinamis** |
| **Aviation** | Pesawat terbang | Aktif saat terbang | Priority khusus | IPv4 publik dinamis |

## Pembahasan detail paket

### 1. Residensial — konektivitas statis ekonomis

- **Geofence** — layanan terkunci pada satu sel (*cell*) alamat terdaftar;
  dipindah keluar sel, internet mati.
- **Best effort** — bandwidth tidak dijamin; di jam sibuk kecepatan turun
  karena kapasitas sel dibagi antar-pengguna.
- **CGNAT** — IP WAN dari blok
  [`100.64.0.0/10`](/networking/subnetting#alamat-khusus-yang-wajib-hafal):
  tidak bisa menerima koneksi masuk langsung (lihat
  [workaround-nya di halaman praktik](/starlink/praktik-mikrotik)).

### 2. Roam (jelajah) — untuk tim lapangan portabel

- **Fitur pause** — langganan bisa dihentikan/diaktifkan per bulan lewat
  portal; hemat untuk proyek lapangan berdurasi pendek.
- **Tanpa batasan sel** — antena mencari satelit di koordinat mana pun ia
  diletakkan (di daratan negara yang ter-cover).

### 3. Bisnis & Enterprise — untuk kebutuhan korporasi

- **Priority data** — jatah kuota prioritas (mis. 40 GB, 1 TB, atau 2 TB per
  bulan). Selama kuota aktif, trafik didahulukan di atas seluruh pengguna
  residensial di sel yang sama — unduhan stabil hingga ±220 Mbps.
- **IP publik IPv4 dinamis** — tanpa CGNAT. Berguna untuk VPN site-to-site
  langsung (IPsec/[WireGuard](/mikrotik/vpn#wireguard-site-to-site)) tanpa
  VPS perantara, dan pemantauan CCTV dari luar.

### 4. Maritim (Mobile Priority) — penakluk samudra

- **Konektivitas laut lepas** — aktif bahkan ratusan mil dari perairan
  teritorial, ditopang [laser ISL](/starlink/arsitektur#mekanisme-laser-antar-satelit-laser-isl).
- **In-motion** — diizinkan beroperasi saat kapal melaju; wajib memakai
  perangkat [Flat High Performance](/starlink/hardware).

## Teknologi masa depan: Direct to Cell

SpaceX mulai menguji **Direct to Cell** — satelit sebagai "BTS terbang":

- **Tanpa alat tambahan** — ponsel LTE standar terhubung langsung ke satelit;
  tidak perlu dish maupun ponsel satelit khusus.
- **Bertahap** — dimulai dari SMS darurat di area blank spot total, menuju
  suara dan data ringan.
- **Cara kerja** — satelit generasi baru membawa modul pemancar seluler yang
  memancarkan sinyal LTE standar dari orbit.

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Apa keuntungan utama paket Bisnis/Enterprise dibanding Residensial dari
   sudut pandang admin jaringan kantor cabang?
   <br>→ **Priority data** (throughput stabil karena didahulukan di atas
   pengguna umum) dan **IP publik IPv4 dinamis** yang mempermudah VPN dan
   akses remote langsung tanpa menembus CGNAT.
2. Bolehkah antena Standard Actuated (Residensial Gen 2) dipakai internetan
   di kapal yang sedang berlayar?
   <br>→ Tidak. Pemakaian *in-motion* melanggar ketentuan layanan, dan motor
   mekanisnya rawan rusak oleh goyangan ombak. Maritim wajib **Flat High
   Performance** + paket **Mobile Priority**.
3. Bagaimana Direct to Cell melayani ponsel pintar standar?
   <br>→ Satelit bertindak sebagai BTS seluler di orbit rendah, memancarkan
   sinyal LTE standar yang ditangkap antena internal ponsel biasa — tanpa
   modem atau adaptor tambahan.

Saatnya praktik: [Praktik Integrasi RouterOS](/starlink/praktik-mikrotik).

</details>