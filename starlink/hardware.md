---
title: Spesifikasi Perangkat Keras Starlink
---

# Spesifikasi Perangkat Keras Starlink

Internet dari orbit rendah menuntut perangkat canggih di sisi pengguna. Sejak
generasi pertama, SpaceX merilis beberapa tipe terminal (*dish*) dengan
perbedaan bentuk, konsumsi daya, dan jenis koneksi kabel. Halaman ini
merangkum spesifikasi tiap tipe sebagai bekal perancangan jaringan di
lapangan.

## Perbandingan antena (dish) Starlink

```text
   Gen 1 (bulat)       Gen 2 (persegi actuated)      Gen 3 (kickstand)      Flat High Performance
    ┌─────────┐              ┌───────────┐             ┌───────────┐             ┌─────────────┐
    │  ● ● ●  │              │           │             │           │             │             │
    │  ● ● ●  │              │           │             │           │             │             │
    └────┬────┘              └─────┬─────┘             └─────┬─────┘             └──────┬──────┘
         │ tiang                   │ tiang                   │ penyangga                │ braket datar
      (motor)                   (motor)                  (manual)                   (statis)
```

| Parameter | Gen 1 (Circular) | Gen 2 (Standard Actuated) | Gen 3 (Standard) | Flat High Performance |
| --- | --- | --- | --- | --- |
| **Bentuk fisik** | Bulat (diameter 58,9 cm) | Persegi (51,3 × 30,3 cm) | Persegi (59,4 × 38,3 cm) | Persegi datar (57,5 × 51,1 cm) |
| **Motor penggerak** | Ada (self-pointing) | Ada (self-pointing) | Tidak ada (kickstand manual) | Tidak ada (pemasangan statis) |
| **Sudut pandang (FoV)** | 110° | 110° | 110° | **140°** (sangat luas) |
| **Konsumsi daya** | 90–150 W | 50–75 W | 75–100 W | **110–150 W** |
| **Peringkat cuaca** | IP54 | IP56 | **IP67** | **IP67** |
| **Aplikasi utama** | Residensial awal (pensiun) | Residensial / Roam umum | Residensial v3 / bisnis baru | **Enterprise / maritim / mobilitas** |

Semua tipe memakai antena **phased array** — beam digeser secara elektronik
untuk mengikuti satelit yang melintas, prinsip yang sama dengan
[gateway LEO modern](/satelit/ground-station#melacak-satelit).

## Detail generasi perangkat

### 1. Gen 2 (Standard Actuated) — si kecil bermotor

Antena paling banyak beredar di Indonesia saat ini.

- **Motor internal** berputar otomatis saat dinyalakan untuk mencari sudut
  langit terbaik.
- **Konektor proprietary SPX** (bukan RJ45) — rawan longgar atau kemasukan
  air bila dipasang di luar tanpa pelindung.
- **Tanpa port LAN** — router bawaannya tidak punya RJ45; untuk menyambung ke
  router pihak ketiga (mis. [MikroTik](/starlink/praktik-mikrotik)) wajib
  membeli **Starlink Ethernet Adapter**.

### 2. Gen 3 (Standard Kickstand) — era datar & RJ45 standar

- **Tanpa motor** — *pointing* dilakukan sekali saat instalasi, dipandu
  kamera *augmented reality* di aplikasi Starlink.
- **Kabel Cat6 shielded ber-RJ45 tahan air** — kabel rusak mudah diganti,
  tak lagi proprietary.
- **Router Wi-Fi 6 dengan 2 port RJ45** bawaan — sambung ke router lain tanpa
  adaptor tambahan.

### 3. Flat High Performance — kelas industri & mobilitas

- **FoV 140°** — melihat lebih banyak satelit sekaligus; saat satelit utama
  terhalang, satelit cadangan langsung mengambil alih.
- **Toleransi gangguan tinggi** — andal di perkebunan, tambang, dan laut
  lepas saat badai.
- **Daya pancar lebih besar** — throughput tetap stabil di kondisi ekstrem;
  satu-satunya tipe yang diizinkan dipakai **bergerak** (in-motion).

## Power over Ethernet (PoE) & catu daya di site remote

Antena Starlink disuplai lewat **PoE tegangan tinggi** dari dalam ruangan:

- **Tegangan operasional** ±48–57 V DC.
- **Arus tinggi** — Flat High Performance bisa menarik hingga ±2,5 A,
  terutama saat pemanas otomatis aktif.
- **UPS wajib di site remote.** Antena butuh ±3–10 menit untuk boot, mencari
  satelit, dan sinkronisasi. Padam listrik sekejap tanpa UPS = internet
  lumpuh beberapa menit. Sediakan UPS minimal 600 VA untuk antena + router.

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Kenapa Gen 3 dirancang tanpa motor penggerak seperti Gen 2?
   <br>→ Mengurangi titik kegagalan mekanis akibat keausan di cuaca luar
   ruangan, menyederhanakan perangkat, dan menurunkan biaya produksi —
   pointing cukup sekali, sisanya dikerjakan phased array secara elektronik.
2. Apa keunggulan utama Flat High Performance dibanding Standard Actuated di
   area dengan hambatan pohon?
   <br>→ FoV jauh lebih luas (140° vs 110°): melacak lebih banyak satelit
   sekaligus sehingga potensi *drop* akibat halangan fisik jauh berkurang.
3. Pengamanan kelistrikan apa yang wajib di site remote dengan listrik
   naik-turun?
   <br>→ **UPS** — menstabilkan tegangan dan menjembatani padam sekejap,
   karena proses boot + sinkronisasi satelit memakan 3–10 menit.

Perangkat sudah dikenal — sekarang paket layanannya:
[Jenis Layanan & Paket](/starlink/layanan).

</details>