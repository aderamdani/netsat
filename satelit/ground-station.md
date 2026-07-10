---
title: Ground Station
---

# Ground Station

Satelit tanpa segmen bumi hanyalah logam mahal di angkasa. **Ground station**
(stasiun bumi) adalah kaki-kaki jaringan satelit: memancarkan uplink, menangkap
downlink, mengendalikan satelit, dan menyambungkan semuanya ke jaringan
teresterial. Halaman ini membedah anatominya, dari parabola raksasa teleport
sampai antena hobi yang melacak satelit cuaca.

## Tiga wajah segmen bumi

| Jenis | Peran | Contoh |
| --- | --- | --- |
| **Teleport / Gateway** | Gerbang trafik komersial: internet ↔ satelit, hub [VSAT](/satelit/vsat), distribusi TV | Antena 7–18 m, berjumlah banyak, dekat serat optik |
| **Stasiun TT&C** | Mengendalikan satelitnya sendiri: telemetri, tracking, komando | Dioperasikan pemilik satelit |
| **Terminal pengguna** | Ujung layanan | Parabola TV, terminal VSAT, dish Starlink, ponsel satelit |

Satu prinsip berlaku untuk semuanya: rantai sinyal yang sama, hanya beda
ukuran.

## Rantai sinyal

```
             ┌────────────── ANTENA ──────────────┐
TERIMA (RX): reflektor → feed → LNA/LNB → down-converter → demodulator → IP
KIRIM (TX) : IP → modulator → up-converter → HPA → feed → reflektor
```

### Antena

Reflektor parabola memfokuskan sinyal ke satu titik (feed). Aturan mainnya:
**makin besar diameter, makin tinggi gain dan makin sempit beam** — antena
besar "mendengar" lebih baik sekaligus lebih pemilih arah.

| Diameter | Kelas | Pemakaian |
| --- | --- | --- |
| 0,45–1,2 m | Terminal | TV rumah, [VSAT](/satelit/vsat) remote |
| 1,8–4,5 m | Profesional kecil | VSAT korporat, SNG (siaran berita) |
| 7–13 m | Gateway | Hub teleport, TT&C |
| 18–70 m | Sains/deep space | Radio astronomi, jaringan antariksa dalam |

### Komponen aktif

- **LNA / LNB** (*low noise amplifier/block*) — penguat pertama di sisi terima;
  komponen paling menentukan kualitas karena derau yang ia tambahkan ikut
  dikuatkan semua tahap berikutnya. LNB (di TV/VSAT) sekaligus menurunkan
  frekuensi ke **L-band** (±1–2 GHz) agar bisa dialirkan lewat kabel koaksial
  murah ke dalam gedung.
- **HPA** (*high power amplifier*) — otot sisi kirim: dari watt (terminal)
  hingga ratusan watt (gateway).
- **Modem satelit** — menerjemahkan antara dunia RF ([DVB-S2](/satelit/komunikasi#modulasi-dan-coding))
  dan dunia [IP](/networking/model-tcp-ip); di sinilah biasanya
  [PEP/akselerasi TCP](/satelit/komunikasi#dampak-latensi-pada-tcp) tinggal.

## Melacak satelit

Antena harus menghadap satelit dengan presisi — beam antena besar hanya
selebar sepersekian derajat.

- **GEO**: satelit diam → antena dipasang sekali, selesai. (Antena gateway
  besar tetap melakukan koreksi halus mengikuti "goyangan" kecil satelit di
  slotnya.)
- **LEO/MEO**: satelit melintas → antena harus **melacak**. Dua pendekatan:
  motor azimuth-elevasi klasik, atau **phased array** yang menggeser beam
  secara elektronik (dish Starlink, gateway LEO modern).

Arah ke satelit dihitung dari data orbit **TLE** yang tersedia publik;
perangkat lunak (mis. Gpredict) mengubahnya menjadi jadwal lintasan dan sudut
azimuth/elevasi. Untuk LEO ada bonus fisika yang harus dikoreksi: **Doppler
shift** — frekuensi sinyal bergeser naik-turun ±10 kHz-an saat satelit
mendekat lalu menjauh.

::: tip Ground station rumahan itu nyata
Dengan **SDR** (software-defined radio) seharga ratusan ribu rupiah dan antena
sederhana, kamu bisa menangkap citra cuaca langsung dari satelit NOAA/Meteor
di 137 MHz, telemetri satelit amatir, bahkan ISS. Komunitas SatNOGS
menautkan ribuan stasiun hobi semacam ini menjadi jaringan ground station
sukarela global — cara belajar segmen bumi paling murah yang pernah ada.
:::

## Pemilihan lokasi

Teleport tidak dibangun sembarangan:

- **Bebas halangan & interferensi** — cakrawala bersih ke arah sabuk GEO,
  jauh dari radar dan pemancar microwave; kadang dilindungi regulasi zona
  senyap frekuensi.
- **Cuaca** — untuk band tinggi (Ka), lokasi kering lebih disukai; di negara
  tropis, [redaman hujan](/satelit/frekuensi-band#redaman-hujan-isu-nomor-satu-di-indonesia)
  dilawan dengan **site diversity**: dua gateway berjauhan, hujan jarang
  menimpa keduanya sekaligus.
- **Serat optik** — percuma menangkap 10 Gbps dari angkasa tanpa pipa darat
  yang menyalurkannya.
- **Geometri orbit** — stasiun untuk satelit polar paling efisien di lintang
  tinggi (Svalbard 78°LU melihat satelit polar di *setiap* orbitnya).

## TT&C: tali kekang satelit

Kanal **telemetry, tracking & command** adalah hubungan paling vital:

- **Telemetri** (turun): ratusan parameter kesehatan — suhu, tegangan baterai,
  tekanan tangki, status setiap subsistem.
- **Tracking**: pengukuran jarak & kecepatan untuk menentukan orbit presisi.
- **Command** (naik): perintah dari bumi — koreksi orbit, konfigurasi
  transponder, hingga perintah pensiun ke graveyard orbit.

Karena memegang kendali penuh atas satelit, kanal ini
[diamankan berlapis](/networking/keamanan#keamanan-komunikasi-satelit):
enkripsi dan autentikasi komando adalah keharusan, bukan pilihan.

## Ground station sebagai layanan (GSaaS)

Tren terbaru: AWS Ground Station dan Azure Orbital menyewakan antena
per menit, seperti cloud menyewakan server. Operator satelit kecil tak perlu
lagi membangun stasiun sendiri di lima benua — cukup memesan slot kontak,
dan data satelitnya muncul langsung di cloud. Pola pikirnya persis
*infrastructure as a service* yang sudah akrab di dunia
[jaringan](/networking/) — bukti kedua dunia ini terus menyatu.

---

Semua komponen di halaman ini bekerja pada frekuensi yang diatur ketat oleh
regulasi internasional. Kenapa Ku dan Ka jadi primadona — dan kenapa hujan
tropis adalah musuh utamanya? Lanjut ke [Frekuensi & Band](/satelit/frekuensi-band).
