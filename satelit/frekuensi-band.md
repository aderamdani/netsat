---
title: Frekuensi & Band
---

# Frekuensi & Band

Spektrum radio adalah lahan tempat semua komunikasi nirkabel tinggal — dan
lahan itu terbatas, diperebutkan, serta diatur ketat. Halaman ini memetakan
band-band satelit dari L sampai Ka, trade-off fisikanya, dan kenapa hujan
tropis Indonesia mengubah cara operator memilih frekuensi.

## Aturan main fisika

Dua hukum sederhana menjelaskan hampir semua keputusan frekuensi:

1. **Makin tinggi frekuensi → makin banyak bandwidth tersedia** → makin besar
   kapasitas data. (Selisih 1% spektrum di 30 GHz = 10× lebar 1% di 3 GHz.)
2. **Makin tinggi frekuensi → makin rentan terhadap atmosfer** — terutama
   hujan — dan makin presisi antena yang dibutuhkan.

Seluruh sejarah komunikasi satelit adalah perjalanan menaiki tangga frekuensi:
dari C-band yang tahan banting, ke Ku yang lebih padat, ke Ka yang berkapasitas
raksasa tapi manja terhadap cuaca.

## Peta band satelit

| Band | Rentang | Karakter | Pemakaian khas |
| --- | --- | --- | --- |
| L | 1–2 GHz | Sangat tahan cuaca, bandwidth sempit | GPS/GNSS, telepon satelit (Inmarsat, Iridium), IoT |
| S | 2–4 GHz | Tahan cuaca | TT&C, radar cuaca, komunikasi ISS |
| C | 4–8 GHz | Tahan hujan, butuh antena besar | Trunking, distribusi TV, **daerah tropis** |
| X | 8–12 GHz | Dialokasikan khusus | Militer & pemerintah |
| **Ku** | 12–18 GHz | Kompromi terbaik: antena kecil, cukup tahan | TV broadcast (DTH), [VSAT](/satelit/vsat) |
| **Ka** | 26–40 GHz | Kapasitas raksasa, paling rentan hujan | HTS (SATRIA-1, Starlink), internet satelit modern |
| Q/V | 40–75 GHz | Frontier riset | Feeder link HTS generasi baru |

Contoh pasangan uplink/downlink (ingat: [selalu berbeda](/satelit/komunikasi#uplink-dan-downlink)):

```
C-band  : uplink ±6 GHz   → downlink ±4 GHz
Ku-band : uplink ±14 GHz  → downlink ±11–12 GHz
Ka-band : uplink ±30 GHz  → downlink ±20 GHz
```

Frekuensi uplink selalu yang lebih tinggi: stasiun bumi lebih mudah
menyediakan daya ekstra untuk melawan redaman daripada satelit yang dayanya
dijatah panel surya.

## Redaman hujan: isu nomor satu di Indonesia

Tetes hujan menyerap dan menghamburkan gelombang radio; efeknya melonjak
drastis mulai ±10 GHz karena ukuran tetes mulai sebanding dengan panjang
gelombang.

| Band | Redaman saat hujan deras tropis |
| --- | --- |
| C (4 GHz) | ±1–2 dB — nyaris tak terasa |
| Ku (12 GHz) | ±10–15 dB — layanan terganggu |
| Ka (20–30 GHz) | **±20–40 dB** — link bisa putus total |

Indonesia termasuk zona hujan terlebat dunia (ITU zone P, intensitas >145
mm/jam pada 0,01% waktu). Konsekuensi praktisnya:

- **C-band tetap hidup** di sini untuk layanan kritis, saat negara empat
  musim sudah lama pindah ke Ku/Ka.
- Desain [link budget](/satelit/komunikasi#link-budget-akuntansi-desibel)
  wajib menyisakan *rain margin* besar.
- Senjata melawan hujan: **ACM** (turunkan modulasi saat hujan — kecepatan
  turun, link bertahan), **UPC** (*uplink power control* — tambah daya saat
  mendung), dan **site diversity** untuk
  [gateway](/satelit/ground-station#pemilihan-lokasi).

::: info Kenapa TV parabola jernih saat hujan padahal streaming putus?
Parabola C-band besar warisan era Palapa menembus hujan dengan santai;
sementara internet Ka-band modern justru yang pertama tumbang saat hujan
deras. Lebih tua tidak selalu lebih buruk — beda band, beda fisika.
:::

## Siapa yang mengatur spektrum?

Spektrum dan [slot orbit GEO](/satelit/orbit#geo-geostationary-orbit) adalah
sumber daya internasional:

- **ITU** (badan PBB) membagi dunia menjadi 3 region, mengalokasikan band per
  layanan, dan mengoordinasikan pendaftaran satelit + slot orbit agar tidak
  saling mengganggu. Keputusan besar diambil di konferensi **WRC** tiap ±4
  tahun.
- **Regulator nasional** (di Indonesia: Kominfo/Komdigi) menerbitkan izin
  stasiun radio dan hak labuh satelit asing.
- Operator wajib melakukan **koordinasi frekuensi**: membuktikan sinyalnya
  tidak mengganggu satelit tetangga (di GEO, tetangga bisa hanya berjarak 2°).

Interferensi bukan teori: satu [VSAT](/satelit/vsat) yang antenanya melenceng
atau dipasang asal bisa mengganggu transponder yang dipakai ratusan terminal
lain — karena itu instalasi bersertifikat dan *carrier ID* menjadi standar
industri.

## Membaca lembar spesifikasi tanpa bingung

Istilah yang hampir pasti kamu temui di brosur layanan satelit:

- **EIRP (dBW)** pada peta *footprint* — makin tinggi angka di lokasimu,
  makin kecil antena yang kamu butuhkan.
- **G/T (dB/K)** — kepekaan penerima satelit di arah lokasimu (menentukan
  ukuran antena kirim).
- **Polarisasi** — orientasi gelombang (horizontal/vertikal, atau melingkar
  RHCP/LHCP). Dua sinyal beda polarisasi bisa memakai frekuensi yang sama —
  spektrum langsung berlipat dua. Salah setel polarisasi = interferensi.
- **Transponder & bandwidth (MHz)** — "kavling" yang kamu sewa; kecepatan
  data nyatanya bergantung [modulasi & FEC](/satelit/komunikasi#modulasi-dan-coding).

## Ringkasan keputusan

| Kebutuhan | Band yang masuk akal | Alasan |
| --- | --- | --- |
| Telepon/IoT genggam global | L | Antena omni kecil, tahan segala cuaca |
| Distribusi TV & trunking tropis | C | Ketersediaan (availability) tertinggi |
| VSAT bisnis & TV rumahan | Ku | Antena 0,6–1,2 m, ekonomi terbaik |
| Internet cepat massal | Ka (HTS) | Kapasitas per Rupiah termurah |
| Militer | X | Alokasi eksklusif, tahan gangguan |

Dengan peta band di tangan, kita siap membedah sistem yang menggabungkan
semuanya — jaringan piringan kecil yang menyatukan pelosok:
[VSAT](/satelit/vsat).
