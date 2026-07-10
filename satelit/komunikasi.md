---
title: Komunikasi Satelit
---

# Komunikasi Satelit

Halaman ini membedah fisika dan teknik di balik sebuah link satelit: perjalanan
sinyal naik-turun, anggaran daya yang menentukan hidup-matinya koneksi,
modulasi, cara banyak pengguna berbagi satu transponder, dan — paling penting
bagi network engineer — apa dampaknya terhadap TCP/IP.

## Uplink dan downlink

- **Uplink** — dari stasiun bumi ke satelit.
- **Downlink** — dari satelit ke stasiun bumi.

Keduanya selalu memakai **frekuensi berbeda** (mis. Ku-band: uplink 14 GHz,
downlink 11 GHz) supaya penerima satelit tidak tuli oleh pemancarnya sendiri.
Pasangan frekuensi ini ditetapkan per [band](/satelit/frekuensi-band).

Di dalam satelit, **transponder** menerima uplink yang sudah sangat lemah,
menggeser frekuensinya, menguatkannya (hingga ~10¹⁰ kali), lalu memancarkannya
sebagai downlink. Satu satelit GEO klasik membawa 24–72 transponder dengan
lebar masing-masing ±36 MHz.

## Latensi per orbit

Kecepatan cahaya ±299.792 km/s adalah batas yang tidak bisa dinegosiasi:

| Jalur | Jarak sekali jalan | RTT total (pengguna → gateway → balik) |
| --- | --- | --- |
| LEO 550 km | 550–1.000 km | ±20–40 ms |
| MEO 8.000 km | ±8.000 km | ±130–180 ms |
| GEO 35.786 km | ±36.000–40.000 km | **±480–560 ms** |

Perhitungan GEO: pengguna→satelit→gateway = ±72.000 km + jalur balik yang
sama = ±144.000 km ÷ 299.792 km/s ≈ **480 ms**, belum termasuk pemrosesan dan
antrean. Bandingkan dengan serat optik Jakarta–Singapura: ±20 ms RTT.

## Link budget: akuntansi desibel

Link budget adalah neraca daya dari pemancar sampai penerima — penentu apakah
link akan hidup, dan dengan kecepatan berapa. Semua dihitung dalam **dB**
(logaritmik: +3 dB = ×2, +10 dB = ×10) supaya perkalian menjadi penjumlahan.

```
EIRP (daya pancar efektif)
  − FSPL (rugi lintasan ruang bebas)
  − rugi atmosfer & hujan
  + G/T (kualitas antena+penerima)
  = C/N (carrier-to-noise) → menentukan kecepatan data maksimum
```

Pemeran utamanya:

- **EIRP** — daya pemancar dikali penguatan antena; "seberapa keras kamu
  berteriak, difokuskan ke satu arah".
- **FSPL** (*free space path loss*) — pelemahan alami sinyal ∝ (jarak ×
  frekuensi)². Untuk GEO di Ku-band nilainya ±205 dB — sinyal tiba
  **30 triliun triliun kali** lebih lemah daripada saat dipancarkan.
- **Rain fade** — redaman hujan, memburuk drastis di frekuensi tinggi;
  momok utama di Indonesia → dibahas di [Frekuensi & Band](/satelit/frekuensi-band#redaman-hujan-isu-nomor-satu-di-indonesia).
- **G/T** — figur kualitas penerima: penguatan antena dibagi suhu derau sistem.
- **Link margin** — cadangan di atas C/N minimum; margin habis = link putus.

::: tip Intuisi tanpa rumus
Link budget itu seperti berbisik dari Jakarta dan berharap terdengar di
Tokyo. Kamu bisa: berteriak lebih keras (EIRP↑), memakai corong yang lebih
fokus (antena besar), telinga yang lebih peka (G/T↑), atau berbicara lebih
lambat dan jelas (modulasi lebih rendah). Desain link = menyeimbangkan
keempatnya dengan biaya.
:::

## Modulasi dan coding

**Modulasi** menumpangkan bit ke gelombang radio. Makin rapat konstelasinya,
makin banyak bit per simbol — tapi makin butuh sinyal bersih:

| Modulasi | Bit/simbol | Butuh C/N | Dipakai saat |
| --- | --- | --- | --- |
| QPSK | 2 | Rendah | Sinyal lemah / hujan deras |
| 8PSK | 3 | Sedang | Kondisi normal |
| 16APSK | 4 | Tinggi | Link bagus |
| 32APSK | 5 | Sangat tinggi | Link premium/cuaca cerah |

**FEC** (*forward error correction*) menambahkan bit redundansi supaya
penerima bisa memperbaiki error tanpa minta kirim ulang — krusial, karena
minta ulang lewat GEO berarti +500 ms. Rate ¾ berarti: 3 bit data per 4 bit
terkirim.

Standar de facto satelit modern, **DVB-S2/S2X**, menggabungkan keduanya dalam
**ACM** (*adaptive coding & modulation*): saat hujan turun, link otomatis
turun gigi (32APSK → QPSK + FEC kuat) — kecepatan turun, tapi koneksi tetap
hidup. Saat cerah, naik gigi lagi.

## Berbagi satu satelit: multiple access

Satu transponder dipakai ratusan terminal. Cara membaginya:

- **FDMA** — bagi per frekuensi (tiap pengguna dapat "jalur" sendiri).
- **TDMA** — bagi per waktu (bergiliran memakai seluruh kanal; dasar sistem
  [VSAT](/satelit/vsat#mf-tdma-berbagi-transponder) modern).
- **CDMA** — bagi per kode (semua bicara bersamaan dengan "bahasa" berbeda;
  dipakai GPS).

Sistem VSAT umumnya **MF-TDMA** (kombinasi frekuensi + waktu) di arah balik,
dan satu *carrier* TDM besar di arah maju.

## Dampak latensi pada TCP

Di sinilah dunia [networking](/networking/model-tcp-ip) dan satelit bertabrakan
paling keras.

**1. Throughput dibatasi jendela.** TCP hanya boleh mengirim satu *window*
data per RTT sebelum menunggu ACK:

```
throughput maks = window / RTT

Window 64 KB, RTT 0,5 s  →  64×8 / 0,5  ≈ 1 Mbps
```

Link 100 Mbps pun akan terasa 1 Mbps per koneksi bila window-nya kecil.
Obatnya: *window scaling* (RFC 7323) hingga jendela ≫ 64 KB — perlu
`bandwidth × delay product` penuh (100 Mbps × 0,5 s ≈ 6 MB!).

**2. Slow start lama.** TCP menaikkan kecepatan per RTT; dengan RTT 500 ms,
mencapai kecepatan penuh butuh berdetik-detik — buruk untuk web yang penuh
koneksi pendek.

**3. Handshake bertumpuk.** TCP + TLS + HTTP ≈ 3 RTT ≈ 1,5 detik sebelum byte
pertama halaman muncul.

### Solusi dunia satelit

- **PEP** (*Performance Enhancing Proxy*) — perangkat di kedua ujung link yang
  "memutus" TCP: ACK dipalsukan secara lokal sehingga pengirim tak perlu
  menunggu 500 ms, dan protokol khusus satelit dipakai di tengah. Transparan
  bagi pengguna — tapi [tidak bisa bekerja pada trafik VPN](/networking/keamanan#vpn-terowongan-terenkripsi)
  yang menyembunyikan header TCP.
- **HTTP/3 (QUIC)** dan *TLS resumption* — memangkas jumlah RTT dari desain
  protokolnya.
- **Caching/prefetching** di sisi remote.
- Atau solusi paling radikal: pindah ke [LEO](/satelit/orbit#leo-low-earth-orbit),
  yang RTT-nya setara kabel.

## Beam: dari satu benua ke titik-titik kecil

Satelit klasik memancarkan **wide beam** — satu pancaran menutup satu kawasan.
**HTS** (*High Throughput Satellite*) seperti SATRIA-1 memakai puluhan–ratusan
**spot beam** kecil yang saling menggunakan ulang frekuensi (seperti sel pada
jaringan seluler) — kapasitas total naik puluhan kali lipat dengan spektrum
yang sama. Konsekuensinya: kapasitas bisa diarahkan persis ke wilayah yang
membutuhkan.

---

Sinyal sudah sampai bumi — sekarang siapa yang menangkap dan mengolahnya?
Lanjut ke [Ground Station](/satelit/ground-station).
