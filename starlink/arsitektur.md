---
title: Arsitektur Jaringan Starlink
---

# Arsitektur Jaringan Starlink

Jaringan Starlink adalah salah satu infrastruktur siber paling kompleks di dunia. Jaringan ini memadukan teknologi komunikasi nirkabel berbasis bumi dengan konstelasi satelit dinamis yang bergerak cepat di ruang angkasa.

Untuk memahami bagaimana data dikirim dari laptop kamu di pedalaman hingga sampai ke server internet di belahan dunia lain, kita perlu membedah tiga segmen utama arsitektur Starlink: **User Segment**, **Space Segment**, dan **Ground Segment**.

---

## Tiga Segmen Utama Jaringan

```text
       [ SPACE SEGMENT ]
       ● [Satelit LEO] ◄═════ Laser (ISL) ═════► ● [Satelit LEO]
        ▲                                          │
        │ Ku-band / Ka-band                        │ Ka-band / V-band
        │ (Frekuensi Sinyal)                       ▼
 ┌──────┴─────────┐                         ┌──────┴──────────┐
 │ USER SEGMENT   │                         │ GROUND SEGMENT  │
 │ Antena Remote  │                         │ Teleport/Gateway│
 └──────┬─────────┘                         └──────┬──────────┘
        │ LAN                                      │ Serat Optik
   [ Laptop ]                                  [ Internet POP / ]
                                               [  ISP Backbone  ]
```

### 1. User Segment (Terminal Pengguna)
Segmen ini terdiri dari perangkat keras yang berada di lokasi pelanggan:
*   **User Terminal (UT):** Antena parabola datar berteknologi *Phased Array* (larik berfase) yang melacak satelit secara elektronik.
*   **Wi-Fi Router:** Mengubah sinyal dari terminal menjadi jaringan lokal (kabel ethernet atau nirkabel Wi-Fi) untuk komputer, HP, atau router kustom pihak ketiga (seperti MikroTik).

### 2. Space Segment (Konstelasi Satelit)
Satelit Starlink bertindak sebagai router terbang di ruang angkasa:
*   **Phased Array Antennas:** Mengirimkan *beam* (berkas sinyal) terfokus ke ribuan terminal pengguna di bawahnya secara dinamis.
*   **Laser Inter-Satellite Links (ISL):** Satelit Starlink dilengkapi pemancar laser khusus. Laser ini memungkinkan satelit untuk berkomunikasi dan mengirimkan data secara langsung antar satelit di luar angkasa dengan kecepatan cahaya, tanpa perlu terus-menerus turun ke stasiun bumi.

### 3. Ground Segment (Stasiun Bumi & Gateway)
Menghubungkan jaringan luar angkasa dengan internet fisik bumi:
*   **Gateway / Teleport:** Antena bumi berukuran besar milik Starlink yang terhubung langsung ke infrastruktur serat optik internet global. Satelit LEO mengirimkan data yang diterimanya ke gateway terdekat.
*   **Point of Presence (POP):** Pusat interkoneksi di mana jaringan Starlink terhubung langsung dengan operator telekomunikasi lokal (ISP) dan penyedia konten global (seperti Google, Cloudflare, AWS).

---

## Mekanisme Laser Antar-Satelit (Laser ISL)

Pada satelit LEO generasi awal (atau sistem satelit komersial biasa), satelit hanya bertindak sebagai "cermin pantul sederhana" (*bent-pipe architecture*). Sinyal dari terminal pengguna harus langsung dipantulkan ke gateway di bumi yang berada dalam jangkauan pandang satelit yang sama.

Jika pengguna berada di tengah samudra lepas atau di kutub utara yang tidak memiliki stasiun bumi dalam radius $1.000\text{ km}$, koneksi internet tidak akan bisa berjalan.

Starlink memecahkan masalah ini dengan **Space Laser Routing**:

```text
 [Terminal di Kapal] ──► [Satelit LEO A] ── Laser ──► [Satelit LEO B] ── Laser ──► [Satelit LEO C] ──► [Gateway Bumi]
```

1.  Terminal di tengah samudra mengirimkan data ke **Satelit LEO A**.
2.  Satelit A mengarahkan lasernya ke **Satelit LEO B** yang berada di depannya, lalu diteruskan ke **Satelit LEO C**.
3.  Satelit C, yang sudah berada di dekat daratan, memancarkan sinyal turun ke **Gateway Bumi** lokal yang terhubung ke jaringan internet serat optik.
4.  Ini memungkinkan cakupan internet global 100% tanpa batas geografis.

---

## Aliran Perjalanan Data (Data Flow)

Mari kita ikuti bagaimana sebuah paket data (misalnya saat kamu membuka halaman web) berjalan melalui jaringan Starlink:

1.  **Laptop ke Antena:** Laptop mengirimkan request HTTP. Paket melewati LAN lokal menuju antena Starlink (*Dish*).
2.  **Transmisi Udara (Uplink):** Antena melakukan modulasi sinyal dan memancarkannya pada frekuensi **Ku-band** (sekitar $14\text{ GHz}$) ke satelit Starlink terdekat yang berada di atas langit ($550\text{ km}$).
3.  **Transit Angkasa:** Satelit memproses paket. Jika satelit berada dalam jangkauan gateway bumi terdekat, data langsung dikirim ke gateway. Jika tidak, data dikirim antar satelit melalui **Link Laser** luar angkasa hingga mencapai satelit yang berada di dekat stasiun bumi.
4.  **Turun ke Bumi (Downlink):** Satelit memancarkan data ke Gateway Bumi menggunakan frekuensi **Ka-band** atau **V-band**.
5.  **Koneksi Backbone:** Gateway meneruskan paket melalui serat optik bawah tanah menuju **Point of Presence (POP)** terdekat, lalu langsung ke server tujuan (misal server Google).
6.  **Paket Balasan:** Balasan dari server tujuan dikirim kembali melalui jalur yang sama dalam waktu total hanya sekitar **$30 - 45\text{ ms}$**.

---

## Cek Pemahaman

1.  Apa perbedaan antara arsitektur satelit *bent-pipe* tradisional dengan arsitektur Starlink yang didukung teknologi *Laser Inter-Satellite Links (ISL)*?
    <br>→ Satelit *bent-pipe* hanya memantulkan sinyal langsung dari stasiun bumi ke terminal pengguna dalam satu waktu (keduanya harus berada di bawah jangkauan satelit yang sama). Sementara dengan Laser ISL, satelit Starlink dapat meneruskan data antar satelit di luar angkasa menggunakan sinar laser, memungkinkan layanan internet aktif di area tanpa stasiun bumi terdekat (seperti di tengah samudera).
2.  Frekuensi apa saja yang digunakan Starlink untuk jalur komunikasi udara, dan apa peruntukannya?
    <br>→ Starlink menggunakan frekuensi **Ku-band** untuk komunikasi antara User Terminal (antena remote pelanggan) dengan satelit LEO, serta menggunakan frekuensi **Ka-band** dan **V-band** untuk komunikasi berkapasitas besar antara satelit dengan Gateway Bumi (Teleport).
3.  Di manakah titik pertemuan pertama antara trafik dari jaringan satelit Starlink dengan jaringan internet fiber optik komersial milik operator bumi?
    <br>→ Titik pertemuan pertamanya adalah di **Gateway Bumi / Teleport**, yang kemudian lalu lintas datanya diteruskan ke **Point of Presence (POP)** untuk berinterkoneksi langsung dengan penyedia internet lokal (ISP) dan server penyedia konten.
