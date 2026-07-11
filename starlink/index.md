---
title: Pengantar Starlink
---

# Pengantar Starlink

**Starlink** adalah layanan internet berbasis konstelasi satelit milik
**SpaceX**. Berbeda dengan internet satelit tradisional yang bertumpu pada
satu-dua satelit besar di [orbit geostasioner (GEO)](/satelit/orbit#geo-geostationary-orbit),
Starlink memakai ribuan satelit kecil yang saling terhubung di
[orbit bumi rendah (LEO)](/satelit/orbit#leo-low-earth-orbit).

Tujuannya: broadband cepat berlatensi rendah ke seluruh penjuru bumi —
terutama area terpencil, pedalaman, dan maritim yang tak terjangkau serat
optik maupun seluler. Modul ini membedah arsitekturnya, perangkat kerasnya,
jenis layanannya, sampai praktik integrasinya dengan RouterOS.

## Konsep konstelasi satelit LEO

- **Ribuan satelit, bukan tiga.** Satelit GEO cukup 3 unit untuk menjangkau
  hampir seluruh bumi; satelit LEO yang rendah punya cakupan sempit dan
  melintas cepat, sehingga butuh ribuan unit agar selalu ada satelit di atas
  langit pengguna — teori lengkapnya di
  [Konstelasi LEO modern](/satelit/orbit#konstelasi-leo-modern).
- **Melintas cepat.** Satelit Starlink mengorbit dengan kecepatan ±27.000
  km/jam (±7,6 km/s), menyelesaikan satu putaran bumi tiap ±90–100 menit.
- **Sangat dekat.** Ketinggian orbit ±550 km — sekitar 65 kali lebih dekat
  daripada satelit GEO (35.786 km).

```text
  [Satelit GEO] ────────────────────────── ±35.786 km (RTT ±500–600 ms)



  [Satelit LEO Starlink] ── ±550 km (RTT ±25–45 ms)

  [BUMI]
```

## Mengapa latensi rendah sangat penting?

Latensi adalah waktu tempuh pulang-pergi data (*Round Trip Time*, RTT):

- **Satelit GEO** — sinyal naik-turun ±36.000 km dua kali; kecepatan cahaya
  membatasi RTT minimum di **±500–600 ms**. Tidak bisa ditawar teknologi
  apa pun — lihat [Latensi per orbit](/satelit/komunikasi#latensi-per-orbit).
- **Starlink LEO** — jarak hanya ±550 km; RTT **±25–45 ms**, setara internet
  kabel.

Selisih ini mengubah kelas aplikasi yang bisa jalan. Di RTT setengah detik,
[TCP sendiri tersiksa](/satelit/komunikasi#dampak-latensi-pada-tcp); di RTT
30 ms, semuanya normal kembali:

- Panggilan video tanpa jeda suara yang mengganggu.
- Aplikasi cloud interaktif (Microsoft Teams, Google Workspace).
- VPN kantor cabang tanpa hambatan *timeout*.
- Game online real-time.

## Skala proyek Starlink

Sejak peluncuran perdana 2019 dengan roket Falcon 9, konstelasi ini tumbuh
menjadi objek buatan manusia terbanyak di orbit. Angka per awal 2026:

- **±9.900 satelit operasional** (dari lebih dari 10.000 yang diluncurkan) —
  sekitar **68% dari seluruh satelit aktif di dunia**.
- **±7 juta pelanggan** di berbagai benua.
- Izin FCC saat ini **12.000 satelit**, dengan pengajuan tambahan hingga
  **30.000** dan visi jangka panjang **±42.000 satelit**.
- **Indonesia**: layanan komersial aktif **sejak 2024** — melayani ritel/
  rumahan, perkebunan, pertambangan, maritim, dan instansi pemerintah.

::: tip Posisi Starlink di peta besar satelit
Starlink tidak "mematikan" VSAT GEO — keduanya mengisi ceruk berbeda:
LEO unggul latensi, GEO/HTS unggul SLA korporat, broadcast, dan kendali
kedaulatan. Perbandingan menyeluruhnya ada di
[LEO vs VSAT vs Starlink](/satelit/leo-vsat-starlink) dan
[VSAT vs LEO: masa depan pelosok](/satelit/vsat#vsat-vs-leo-masa-depan-pelosok).
:::

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Berapa ketinggian rata-rata satelit Starlink, dan mengapa latensinya jauh
   lebih rendah dari VSAT GEO tradisional?
   <br>→ ±550 km di atas bumi — jauh lebih dekat daripada GEO (35.786 km),
   sehingga waktu tempuh sinyal (yang dibatasi kecepatan cahaya) jauh lebih
   singkat: RTT ≈30 ms vs ±500–600 ms.
2. Mengapa Starlink butuh ribuan satelit aktif, sementara GEO cukup 3 satelit
   untuk mencakup hampir seluruh bumi?
   <br>→ Karena orbit LEO sangat rendah, *footprint* tiap satelit sempit dan
   satelit melintas sangat cepat — dibutuhkan ribuan satelit yang saling
   menyambung agar selalu ada satelit di atas langit pengguna setiap saat.
3. Aplikasi apa saja yang sangat terpengaruh latensi sehingga berjalan baik di
   Starlink tetapi tersiksa di VSAT GEO?
   <br>→ Aplikasi real-time: panggilan video, game online, VPN terenkripsi,
   dan aplikasi database/cloud interaktif yang sensitif terhadap jeda.

Lanjut ke bagaimana semua ini tersusun: [Arsitektur Jaringan](/starlink/arsitektur).

</details>