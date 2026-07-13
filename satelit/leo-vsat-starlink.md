---
title: LEO vs VSAT GEO vs Starlink
---

# Jaringan Satelit LEO vs VSAT GEO vs Starlink

Perkembangan teknologi luar angkasa telah melahirkan paradigma baru dalam komunikasi satelit. Kita sedang bergeser dari era satelit tunggal berukuran raksasa di orbit jauh (**GEO**), ke era konstelasi ribuan satelit kecil di orbit sangat rendah (**LEO**), dengan **Starlink** sebagai pelopor utama di pasar konsumen dan bisnis.

Halaman ini membahas perbandingan mendalam arsitektur, cara kerja, serta implikasi jaringan dari masing-masing teknologi ini.

---

## Tiga Arsitektur Orbit Satelit

Berdasarkan ketinggian orbitnya di atas permukaan bumi, satelit komunikasi terbagi menjadi tiga kategori utama:

| Orbit | Ketinggian | RTT | Karakteristik |
| --- | --- | --- | --- |
| **GEO** (Geostationary Earth Orbit) | ±35.786 km, tepat di atas ekuator | ±500–600 ms | Periode orbit = rotasi bumi → tampak "diam" dari bumi; cukup **3 satelit** untuk hampir seluruh bumi |
| **MEO** (Medium Earth Orbit) | ±8.000–20.000 km | ±120–180 ms | Bergerak lambat; dipakai navigasi (GPS, GLONASS) dan broadband khusus (SES O3b) |
| **LEO** (Low Earth Orbit) | ±500–1.200 km | ±25–45 ms | Melesat ±27.000 km/jam, satu putaran bumi tiap ±90–120 menit; latensi setara kabel |

Teori lengkap tiap orbit — kenapa 35.786 km "diam", graveyard orbit, sun
outage — ada di [Orbit: LEO, MEO, GEO](/satelit/orbit).

---

## Teknologi Kunci LEO: Phased Array & Beamforming

Pada VSAT GEO tradisional, antena remote berupa piringan parabola statis yang diarahkan sekali pada satu satelit. Pada sistem LEO (seperti Starlink), satelit terus meluncur melintasi langit dan menghilang di balik cakrawala setiap beberapa menit. 

Bagaimana antena remote bisa mengikuti satelit tanpa ada motor penggerak mekanis yang berputar cepat setiap saat?

### Phased Array Antenna (Antena Larik Berfase)
Antena Starlink ("Dishy") menggunakan teknologi **Phased Array**. Permukaan antena terdiri dari ratusan antena pemancar/penerima mikro kecil yang dikontrol secara elektronik. 

Dengan memanipulasi milidetik fase waktu (*phase delay*) sinyal yang keluar dari setiap pemancar mikro, arah gelombang dapat dibelokkan (*steering beam*) secara instan ke arah satelit yang lewat tanpa menggerakkan fisik antena sama sekali.

```text
       Sinyal dibelokkan ke kanan secara elektronik
              \  \  \  \  \  \
               \  \  \  \  \  \
     ┌──────────────────────────────────┐
     │ ◉   ◉   ◉   ◉   ◉   ◉   ◉   ◉   ◉│ -> Ratusan pemancar mikro
     └──────────────────────────────────┘
                 Antena Larik Berfase
```

### Mekanisme Handover LEO
Karena satelit LEO bergerak cepat, terminal remote harus melakukan **handover** (perpindahan link) dari satu satelit yang akan tenggelam di cakrawala ke satelit berikutnya yang baru terbit.
*   Perpindahan ini terjadi setiap **10 hingga 15 menit**.
*   Proses ini diatur secara ketat oleh algoritma penjadwalan satelit untuk memastikan perpindahan frekuensi terjadi dalam hitungan milidetik agar tidak terjadi putus koneksi (*packet loss*).

---

## Perbandingan Komparatif: VSAT GEO vs Starlink (LEO)

| Parameter | VSAT GEO Tradisional | Starlink (LEO Enterprise) |
| --- | --- | --- |
| **Ketinggian Orbit** | 35.786 km | ≈550 km |
| **Latensi (RTT)** | 500–650 ms | 25–45 ms |
| **Throughput (Speed)** | Terbatas (khas 2–20 Mbps) | Tinggi (100–220 Mbps downlink) |
| **Pengaruh Cuaca** | C-band sangat tahan hujan. Ku/Ka rentan. | Ku-band rentan, diimbangi kekuatan sinyal LEO yang besar. |
| **Jaminan SLA / CIR** | Sangat matang (kontrak dedicated 1:1, QoS terjamin) | Umumnya *best effort* (Prioritas Bisnis/Enterprise) |
| **Instalasi** | Rumit (pointing manual presisi, sertifikasi teknisi) | Mandiri / *Self-aligning* (Phased Array) |
| **Keamanan Data** | Jalur data langsung ke stasiun bumi lokal milik ISP. | Jalur data melewati konstelasi satelit global. |

---

## Dampak Latensi LEO vs GEO pada Protokol Jaringan

Perbedaan latensi antara GEO (≈600 ms) dan LEO (≈30 ms) memiliki implikasi besar bagi protokol jaringan:

*   **TCP Windowing:** Pada link GEO, TCP membutuhkan fitur PEP (Performance Enhancing Proxy) untuk menghindari *window starvation* akibat waktu tunggu ACK yang lama. Di LEO, TCP bawaan OS biasa (seperti BBR atau Cubic) dapat bekerja maksimal tanpa bantuan proxy khusus.
*   **Real-time Applications:** Aplikasi interaktif seperti VoIP, VPN IPsec, game online, dan protokol transaksi perbankan berkinerja buruk di GEO karena jeda suara atau waktu respons yang lama. Di LEO, aplikasi ini berjalan lancar seperti di jaringan kabel.
*   **Routing Dynamic (OSPF/BGP):** Timer protokol routing dinamis di GEO harus dilonggarkan (misal *Hello Interval* ≥10 detik) agar tidak memvonis link terputus karena keterlambatan transmisi. Di LEO, timer default dapat digunakan dengan aman.

---

## Isu Kedaulatan Data & Gateway Lokal

Desain jaringan satelit tradisional (VSAT) selalu menempatkan stasiun bumi (teleport/hub) di negara yang sama dengan remote. Contohnya, jika remote VSAT berada di Papua, ia memancar ke satelit lalu turun ke stasiun bumi di Jakarta. Hal ini memudahkan kontrol kedaulatan data (*data sovereignty*) dan penyadapan hukum (*lawful interception*).

Pada jaringan Starlink:
1.  **Laser Inter-Satellite Links (ISL):** Satelit Starlink generasi baru dilengkapi laser untuk saling mengirim data di ruang angkasa tanpa harus turun ke stasiun bumi terdekat.
2.  **Stasiun Bumi (Gateway):** Data remote dapat dialihkan secara dinamis di luar angkasa ke gateway Starlink di negara tetangga jika gateway lokal sedang mengalami gangguan atau kelebihan beban.
3.  **Implikasi:** Ini memicu perdebatan regulasi di berbagai negara terkait kepatuhan privasi data, kontrol lalu lintas internet nasional, dan keamanan siber.

---

## Starlink Maritim & Mobilitas Tinggi

Salah satu skenario penggunaan satelit LEO terpopuler adalah untuk konektivitas di atas kendaraan yang bergerak aktif (kapal laut, yacht, pesawat terbang, kereta api, dan kendaraan operasional tambang).

### Tantangan Satelit Bergerak di atas Kendaraan Bergerak
Ketika antena penerima berada di atas kapal yang terombang-ambing ombak (*rolling and pitching*), dan satelit LEO di atasnya meluncur dengan kecepatan 27.000 km/jam, mempertahankan kestabilan sinyal menjadi sangat kompleks.

Untuk kebutuhan mobilitas ini, Starlink menggunakan antena tipe **Flat High Performance**:
*   **Tanpa Motor Mekanis:** Antena dipasang mendatar (flat) secara permanen pada struktur kapal/kendaraan.
*   **Sensor IMU Internal:** Antena dilengkapi dengan sensor *gyroscope* dan *accelerometer* (IMU - *Inertial Measurement Unit*) internal serta modul GPS.
*   **Kompensasi Instan:** Antena mendeteksi guncangan dan perubahan sudut kendaraan ribuan kali per detik. Algoritma komputer langsung menyesuaikan fase sinyal (*beamforming electronic steering*) untuk mengarahkan pancaran gelombang ke satelit LEO target secara instan, mencegah putus sinyal akibat goyangan kapal.

---

## Cek pemahaman

1.  Mengapa Starlink tidak memerlukan perangkat PEP (akselerator TCP) eksternal seperti halnya VSAT GEO?
    <br>→ Karena latensi Starlink sangat rendah (≈30 ms). Dengan latensi sekecil itu, mekanisme konfirmasi paket TCP (ACK) diterima dengan cepat, sehingga jendela pengiriman TCP tidak mengalami kemacetan (*window starvation*) dan kecepatan tinggi bisa dicapai secara native.
2.  Apa yang dimaksud dengan teknologi *Phased Array* pada antena Starlink dan apa fungsinya?
    <br>→ Teknologi antena larik berfase yang memungkinkan antena mengarahkan dan memfokuskan gelombang sinyal secara elektronik. Fungsinya untuk melacak dan berpindah (*handover*) antar satelit LEO yang meluncur cepat di langit tanpa membutuhkan gerakan fisik motorik antena.
3.  Mengapa handover satelit pada sistem LEO bisa menjadi titik kritis terjadinya packet loss jika konfigurasi tidak optimal?
    <br>→ Karena perpindahan harus terjadi dalam hitungan milidetik secara presisi dari satelit lama ke satelit baru yang frekuensinya mungkin berbeda. Jika terjadi jeda sinkronisasi frekuensi atau gangguan pointing elektronik pada saat perpindahan tersebut, paket data yang dikirim pada milidetik itu akan hilang (*packet loss*).
