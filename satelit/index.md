---
title: Pengantar Satelit
---

# Pengantar Satelit

Satelit adalah benda yang mengorbit benda lain. Bulan adalah satelit alami
Bumi; yang dibahas modul ini adalah **satelit buatan** — lebih dari 11.000
perangkat aktif yang saat ini melesat di atas kepala kita, meneruskan panggilan
telepon, siaran TV, ramalan cuaca, posisi GPS, dan trafik internet.

Modul ini fokus pada satelit **komunikasi**: bagaimana ia bertahan di orbit,
bagaimana sinyal naik-turun puluhan ribu kilometer, dan infrastruktur bumi
yang membuatnya berguna.

## Kenapa satelit tidak jatuh?

Satelit *sebenarnya terus jatuh* — tapi bergerak ke samping begitu cepat
sehingga lengkungan jatuhnya sejajar dengan lengkungan Bumi. Itulah orbit:
keseimbangan antara kecepatan dan gravitasi, tanpa mesin yang menyala
terus-menerus.

::: info Eksperimen pikiran Newton: bola meriam
Newton sendiri yang pertama menjelaskannya. Tembakkan meriam dari puncak
gunung: bola jatuh 1 km di depan. Tembak lebih kencang: jatuh 10 km, 100 km —
lengkungan jatuhnya makin landai. Pada kecepatan tertentu (±7,9 km/s di
permukaan), lengkungan jatuhnya **tepat sejajar lengkungan Bumi**: bola terus
jatuh tapi tak pernah mendarat. Selamat — bola meriammu sekarang satelit.
Itu juga sebabnya astronot "melayang": mereka bukan bebas gravitasi, mereka
sedang *terjun bebas terus-menerus* bersama stasiunnya.
:::

Konsekuensinya ada satu hukum yang mengatur segalanya (hukum Kepler ke-3):
**makin tinggi orbitnya, makin lambat satelit mengelilingi Bumi**.

- Di ketinggian 550 km: sekali keliling ±95 menit (kecepatan ±7,6 km/s).
- Di ketinggian 35.786 km: sekali keliling tepat **satu hari** — satelit
  tampak diam di langit. Inilah orbit geostasioner (GEO), dibahas tuntas di
  [Orbit](/satelit/orbit).

## Tiga segmen sebuah sistem satelit

Industri membagi sistem satelit menjadi tiga bagian yang akan terus dirujuk
sepanjang modul:

| Segmen | Isi | Dibahas di |
| --- | --- | --- |
| **Space segment** | Satelitnya sendiri (bus + payload) | Halaman ini & [Orbit](/satelit/orbit) |
| **Ground segment** | Gateway, teleport, stasiun kendali | [Ground Station](/satelit/ground-station) |
| **User segment** | Terminal pengguna: parabola TV, VSAT, dish Starlink, ponsel satelit | [VSAT](/satelit/vsat) |

Uang dan kerumitan tersebar di ketiganya — satelit paling canggih pun tak
berguna bila segmen bumi dan terminalnya tidak dirancang seimbang.

## Anatomi satelit komunikasi

Satelit terdiri dari dua bagian besar: **bus** (platform penunjang hidup) dan
**payload** (muatan yang menghasilkan uang).

| Subsistem | Bagian | Tugas |
| --- | --- | --- |
| Payload | Antena & **transponder** | Menerima, menguatkan, dan memancarkan ulang sinyal |
| Bus | Panel surya + baterai | Sumber daya (baterai untuk saat gerhana) |
| Bus | AOCS (kendali sikap & orbit) | Menjaga orientasi antena dan posisi orbit |
| Bus | Propulsi | Koreksi orbit (*station-keeping*), buang ke orbit kuburan |
| Bus | Termal | Membuang panas di ruang hampa (radiator, **MLI** — foil emas ikonik itu) |
| Bus | **TT&C** | Kanal telemetri, tracking & komando dari/ke bumi |

::: info Transponder: fotokopi sinyal di angkasa
Transponder klasik (*bent pipe*) tidak membaca isi data — ia hanya menerima
sinyal [uplink](/satelit/komunikasi#uplink-dan-downlink), menggeser
frekuensinya, menguatkannya jutaan kali, lalu memancarkannya kembali sebagai
downlink. Satelit modern (HTS/*regenerative*) mulai mengolah sinyal di
orbit — mendemodulasi, merutekan antar-beam, bahkan
[antar-satelit via laser](/satelit/orbit#konstelasi-leo-modern).
:::

## Untuk apa saja satelit dipakai?

| Kategori | Contoh | Orbit khas |
| --- | --- | --- |
| Komunikasi | Telkomsat Merah Putih, Intelsat, Starlink | GEO, LEO |
| Navigasi (GNSS) | GPS, Galileo, BeiDou, GLONASS | MEO |
| Observasi bumi | Citra cuaca, pemetaan, pertanian | LEO (SSO), GEO |
| Sains & antariksa | Teleskop, riset iklim | Beragam |
| Militer | Komunikasi aman, pengintaian, peringatan dini | Beragam |

Modul ini menyorot baris pertama — tapi baris kedua (navigasi) akan sering
mampir, karena GPS adalah contoh terbaik sistem [MEO](/satelit/orbit#meo-medium-earth-orbit).

## Indonesia dan satelit

Sulit menemukan negara yang lebih "berkepentingan" dengan satelit daripada
Indonesia: ±17.000 pulau, pegunungan, dan lautan luas membuat kabel tidak
selalu ekonomis.

- **1976** — Indonesia menjadi negara berkembang *pertama* yang
  mengoperasikan satelit komunikasi domestik sendiri: **Palapa A1**,
  menyatukan siaran TV dan telepon nusantara.
- Kini: satelit **SATRIA-1** (2023, satelit HTS berkapasitas 150 Gbps)
  melayani puluhan ribu titik layanan publik — sekolah, puskesmas, kantor
  desa — lewat [VSAT](/satelit/vsat).
- Ribuan menara BTS di daerah terpencil memakai *satellite backhaul*: sinyal
  ponselmu di pulau kecil sangat mungkin menumpang satelit sebelum menyentuh
  internet.

## Rantai komunikasi satelit dari ujung ke ujung

Gambaran besar yang akan dibedah sepanjang modul:

```text
[Pengguna] ─ LAN ─ [Terminal VSAT] ~~uplink 14 GHz~~▶ [Satelit GEO]
                                                          │ transponder
[Internet] ─ fiber ─ [Ground Station / Teleport] ◀~~downlink 11 GHz~~┘
```

1. Terminal remote ([VSAT](/satelit/vsat)) memancarkan ke satelit.
2. [Transponder](/satelit/komunikasi) menggeser frekuensi dan menguatkan.
3. [Ground station](/satelit/ground-station) menangkap, mengolah, dan
   menyambungkan ke internet/jaringan telepon.
4. Semua berlangsung di [frekuensi yang diatur ketat](/satelit/frekuensi-band).

Bagi [model TCP/IP](/networking/model-tcp-ip), seluruh rantai ini hanyalah
"lapisan link" — tapi dengan karakter unik: jarak 36.000 km berarti
[latensi](/satelit/komunikasi#latensi-per-orbit) yang tak bisa ditawar oleh
teknologi mana pun, karena dibatasi kecepatan cahaya.

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Kenapa satelit tidak butuh mesin menyala terus untuk tetap di orbit? <br>→
   Orbit adalah **jatuh bebas yang terus meleset**: kecepatan ke samping
   membuat lengkung jatuhnya sejajar lengkung Bumi. Mesin hanya dinyalakan
   sesekali untuk koreksi (*station-keeping*).
2. Bagian mana dari satelit yang "menghasilkan uang", dan bagian mana yang
   "menjaganya tetap hidup"? <br>→ **Payload** (transponder & antena)
   menghasilkan; **bus** (daya, termal, propulsi, AOCS, TT&C) menjaga.
3. Transponder *bent pipe* mengerti isi data yang dilewatkannya? <br>→ Tidak —
   ia hanya menggeser frekuensi dan menguatkan. Baginya paket TCP, siaran TV,
   dan telepon sama saja: gelombang radio.
4. Kenapa Indonesia sangat bergantung pada satelit dibanding banyak negara
   lain? <br>→ Geografi: ±17.000 pulau bergunung dan berlaut membuat kabel
   tidak selalu ekonomis — satelit menjangkau semuanya dari satu titik orbit.


</details>

## Peta modul ini

1. [Orbit: LEO, MEO, GEO](/satelit/orbit) — di mana satelit tinggal dan konsekuensinya
2. [Komunikasi Satelit](/satelit/komunikasi) — link budget, modulasi, dan latensi
3. [Ground Station](/satelit/ground-station) — kaki bumi dari jaringan angkasa
4. [Frekuensi & Band](/satelit/frekuensi-band) — L, S, C, Ku, Ka, dan hujan tropis
5. [VSAT](/satelit/vsat) — internet piringan kecil yang menyatukan nusantara
6. [VSAT — Operasional & Perencanaan](/satelit/vsat-lanjut) — SCPC, bandwidth planning, instalasi, troubleshooting, platform, SATRIA-1

Disarankan membaca [modul Networking](/networking/) dulu — terutama
[TCP/IP](/networking/model-tcp-ip) — supaya bab latensi terasa "nyambung".
