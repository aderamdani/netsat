---
title: 'Orbit: LEO, MEO, GEO'
---

# Orbit: LEO, MEO, GEO

Ketinggian orbit adalah keputusan desain paling fundamental sebuah sistem
satelit — ia menentukan latensi, cakupan, jumlah satelit yang dibutuhkan,
umur pakai, dan biaya. Halaman ini membedah tiga kelas utama plus beberapa
orbit istimewa.

## Peta ketinggian

Rentangnya jauh berbeda — LEO ratusan km, GEO puluhan ribu km:

| Parameter | LEO | MEO | GEO |
| --- | --- | --- | --- |
| Ketinggian | 400–2.000 km | 2.000–35.786 km | 35.786 km |
| Periode orbit | 90–120 menit | 2–24 jam | 23 j 56 m (sidereal) |
| Latensi RTT (bumi–satelit–bumi) | 5–40 ms | 100–180 ms | ±480–560 ms |
| Cakupan per satelit | Kecil (radius ratusan km) | Regional | ⅓ permukaan bumi |
| Satelit untuk cakupan global | Ratusan–ribuan | 10–30 | 3–4 |
| Antena pengguna | Harus melacak (phased array) | Melacak | **Diam** (dipasang sekali) |
| Contoh | Starlink, ISS, observasi bumi | GPS, Galileo, O3b | TV broadcast, VSAT klasik, SATRIA-1 |

## GEO (Geostationary Orbit)

Di ketinggian tepat **35.786 km** di atas ekuator, periode orbit satelit sama
dengan rotasi Bumi — satelit "menggantung" di titik langit yang sama selamanya.
Konsep ini dipopulerkan Arthur C. Clarke pada 1945, sehingga sabuk GEO kadang
disebut *Clarke Belt*.

Angka 35.786 km bukan pilihan manusia, melainkan **jawaban tunggal dari
fisika**: hanya ada satu ketinggian yang periode orbitnya tepat satu hari
sideris (23 j 56 m — rotasi Bumi terhadap bintang, bukan 24 jam terhadap
matahari). Lebih rendah → satelit mendahului Bumi; lebih tinggi → tertinggal.
Dan orbitnya *harus* tepat di atas ekuator: orbit miring dengan periode sama
(disebut geo**sinkron**, bukan geo**stasioner**) tampak berayun membentuk
angka 8 di langit.

::: info Gerhana dan matahari yang "menyilaukan"
Dua ritme musiman kehidupan satelit GEO: sekitar ekuinoks (Maret &
September), satelit melintasi bayangan Bumi hingga ±70 menit per hari —
seluruh daya berpindah ke baterai (*eclipse season*). Pada musim yang sama,
matahari tepat berada **di belakang satelit** dilihat dari antena bumi
beberapa menit sehari: derau matahari menenggelamkan sinyal (*sun outage*) —
TV satelit "kresek-kresek" beberapa menit, lalu normal sendiri. Operator
mengumumkan jadwalnya seperti jadwal gerhana.
:::

**Keunggulan yang membuatnya legendaris:**

- Antena bumi cukup dipasang sekali, tanpa motor pelacak — kunci murahnya
  [VSAT](/satelit/vsat) dan parabola TV.
- Tiga satelit cukup untuk menutup hampir seluruh bumi.
- Ideal untuk broadcast: satu pancaran = satu benua.

**Harganya:**

- **Latensi fisika**: 35.786 km ÷ 299.792 km/s ≈ 120 ms sekali jalan ke
  satelit; pengguna→satelit→gateway→balik lagi ≈ **500 ms RTT**. Tidak bisa
  dikurangi oleh teknologi apa pun — ini kecepatan cahaya.
- Sinyal melemah drastis (rugi lintasan ∝ jarak²) — butuh antena dan daya besar.
- Tidak melayani lintang kutub (>±81°; sudut elevasi terlalu rendah di atas
  ±70°).
- **Slot orbit terbatas**: sabuk GEO adalah "kavling" internasional yang
  dijatah ITU per negara — bagian dari alasan geopolitik satelit itu rumit.

Satelit GEO tua dipensiunkan ke **graveyard orbit** (±300 km di atas GEO)
dengan sisa bahan bakar terakhirnya, agar slotnya bisa dipakai penggantinya.

## MEO (Medium Earth Orbit)

Wilayah luas antara LEO dan GEO. Penghuni utamanya adalah sistem navigasi
(GNSS) di ±20.200 km dengan periode ±12 jam:

- **GPS** (AS, 31 satelit), **Galileo** (Eropa), **BeiDou** (Tiongkok),
  **GLONASS** (Rusia).
- Ketinggian ini kompromi pas: tiap satelit terlihat dari area luas (cukup
  24–30 satelit agar minimal 4 selalu terlihat — syarat menghitung posisi
  3D + waktu), tapi sinyal masih cukup kuat untuk chip kecil di ponsel.

Untuk komunikasi, konstelasi **O3b/mPOWER** (SES) di 8.062 km membuktikan
jalan tengah: latensi RTT ±150 ms (jauh lebih nyaman dari GEO) dengan jumlah
satelit jauh lebih sedikit dari LEO.

## LEO (Low Earth Orbit)

Rumah bagi ISS, satelit observasi bumi, dan konstelasi internet modern.
Dekat berarti:

- **Latensi kecil** (RTT 20–40 ms — setara internet kabel).
- **Sinyal kuat** — antena pengguna bisa sekecil kotak pizza.
- Tapi satelit **melintas cepat** (±7,6 km/s): dari satu titik di bumi, satelit
  hanya terlihat beberapa menit → butuh **ribuan** satelit dan antena yang
  terus berpindah target (*handover*) agar layanan tak terputus.

### Konstelasi LEO modern

Starlink (±7.000+ satelit aktif di ±550 km), OneWeb/Eutelsat, dan Kuiper
mengubah ekonomi satelit: diproduksi massal, diluncurkan puluhan sekaligus,
umur pendek (5–7 tahun, lalu deorbit dan terbakar di atmosfer). Terminal
pengguna memakai **phased array** — antena datar yang mengarahkan beam secara
elektronik tanpa bagian bergerak — dan generasi barunya saling terhubung
**laser antar-satelit** (*inter-satellite link*), membentuk jaringan
[mesh](/networking/#topologi-jaringan) yang benar-benar melakukan
[routing](/networking/routing#routing-dan-satelit) di angkasa.

::: warning Sisi gelap: sampah antariksa
LEO makin padat. Puing (satelit mati, bekas roket, serpihan tabrakan) melesat
±7,5 km/s — sekrup kecil pun berenergi peluru meriam. Skenario terburuknya
**sindrom Kessler**: tabrakan beruntun yang membuat orbit tak terpakai.
Mitigasi kini menjadi kewajiban desain: deorbit ≤5 tahun setelah misi,
kemampuan manuver menghindar, dan pelacakan objek oleh radar jaringan
*space surveillance*.
:::

## Orbit istimewa lainnya

- **SSO (Sun-Synchronous Orbit)** — LEO polar (±600–800 km) yang presesinya
  disetel agar selalu melintas suatu tempat pada jam matahari yang sama;
  wajib bagi satelit pencitraan yang butuh pencahayaan konsisten.
- **HEO / Molniya** — elips ekstrem (perigee ±600 km, apogee ±40.000 km);
  satelit "berlama-lama" di atas lintang tinggi yang tak terjangkau GEO —
  solusi klasik Rusia untuk komunikasi kutub.
- **GTO (Geostationary Transfer Orbit)** — elips antara LEO dan GEO; halte
  transit satelit GEO yang baru diluncurkan sebelum menyalakan motornya
  sendiri menuju orbit final.

## Elemen orbit (sekilas untuk yang penasaran)

Posisi dan bentuk sebuah orbit dijelaskan enam **elemen Kepler** — dua yang
paling sering muncul dalam percakapan:

- **Inklinasi** — sudut bidang orbit terhadap ekuator: 0° = orbit
  ekuatorial (GEO), ±90° = polar (melintasi kutub), 51,6° = ISS.
- **Eksentrisitas** — kebulatan orbit: 0 = lingkaran sempurna, mendekati 1 =
  elips memanjang (Molniya ±0,74).

Data orbit satelit dipublikasikan dalam format **TLE** (*two-line element*)
dan bisa dipakai siapa saja untuk menghitung kapan satelit lewat — inilah yang
dikerjakan perangkat lunak pelacak di [ground station](/satelit/ground-station#melacak-satelit).

## Memilih orbit = memilih kompromi

| Kalau prioritasmu... | Pilih | Alasannya |
| --- | --- | --- |
| Broadcast TV satu benua | GEO | Satu satelit, antena murah tanpa pelacak |
| Internet interaktif latensi rendah | LEO | RTT ~20–40 ms |
| Navigasi global | MEO | Geometri & jumlah satelit optimal |
| Backhaul terpencil dengan CAPEX kecil | GEO ([VSAT](/satelit/vsat)) | Terminal murah, ekosistem matang |
| Komunikasi wilayah kutub | HEO / LEO polar | GEO tak menjangkau |

## Cek pemahaman

1. Kenapa parabola TV tidak butuh motor, sedangkan dish Starlink "hidup"?
2. Kalau LEO latensinya jauh lebih baik, kenapa broadcast TV tetap di GEO?
3. Satelit GEO kehabisan bahan bakar. Apa langkah terakhirnya, dan kenapa?
4. Kenapa GPS butuh minimal 4 satelit terlihat, bukan 3?

<details>
<summary>Lihat jawaban</summary>

1. TV memakai satelit **GEO** yang diam relatif terhadap Bumi; Starlink
   di **LEO** melintas cepat sehingga beam harus terus dipindah (phased
   array) dan berpindah satelit tiap beberapa menit.
2. Broadcast tidak peduli latensi; yang dibutuhkan **satu pancaran
   menutup satu benua** dan antena penerima semurah mungkin — definisi GEO.
3. Naik ±300 km ke **graveyard orbit** dengan sisa bahan bakar. Slot
   GEO langka dan diatur ITU — harus dikosongkan untuk penggantinya, dan
   bangkai yang melayang di sabuk GEO membahayakan tetangga.
4. Tiga untuk posisi 3D (x, y, z), satu lagi untuk **koreksi jam** penerima
   — jam ponsel jauh dari presisi jam atom satelit.

</details>

Ketinggian sudah dipilih — sekarang bagaimana sinyal benar-benar menempuh
jarak itu? Lanjut ke [Komunikasi Satelit](/satelit/komunikasi).