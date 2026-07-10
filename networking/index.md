---
title: Pengantar Jaringan
---

# Pengantar Jaringan

Jaringan komputer adalah kumpulan perangkat — komputer, ponsel, server, sensor —
yang saling terhubung sehingga bisa bertukar data. Sesederhana dua laptop yang
berbagi file lewat kabel, serumit internet yang menghubungkan miliaran perangkat
lintas benua dan **lintas orbit**.

Halaman ini meletakkan fondasi: istilah, jenis jaringan, topologi, dan perangkat
yang akan terus muncul di seluruh modul.

## Apa yang sebenarnya terjadi saat kamu membuka situs ini?

Sebelum masuk teori, ini gambaran besarnya. Saat kamu mengetik
`netsat.aderamdani.web.id` dan menekan Enter:

1. **Resolusi nama** — komputermu bertanya ke server [DNS](/networking/protokol#dns):
   "berapa alamat IP dari nama ini?"
2. **Pembentukan koneksi** — komputermu menjalin koneksi
   [TCP](/networking/model-tcp-ip#lapisan-transport-ujung-ke-ujung) ke alamat IP tersebut.
3. **Permintaan data** — lewat koneksi itu, browser mengirim permintaan
   [HTTP](/networking/protokol#http-dan-https) yang dienkripsi TLS.
4. **Perjalanan paket** — permintaan dipecah menjadi paket-paket, tiap paket
   diarahkan [router](/networking/routing) demi router sampai ke server tujuan.
5. **Balasan** — server membalas dengan halaman ini, juga dalam bentuk
   paket-paket yang dirakit ulang oleh komputermu.

Seluruh modul networking pada dasarnya membedah lima langkah ini lapis demi lapis.

::: info Analogi yang dipakai sepanjang modul: sistem pos
Bayangkan jaringan sebagai **sistem pos**. Data adalah isi surat; paket adalah
amplop dengan alamat pengirim dan penerima; router adalah kantor sortir yang
memutuskan surat naik truk yang mana; dan protokol adalah aturan penulisan
alamat yang disepakati semua kantor pos sedunia. Analogi ini tidak sempurna,
tapi hampir setiap konsep baru di modul ini bisa dipetakan kembali ke sana —
dan kami akan sering melakukannya.
:::

## Istilah dasar yang akan terus muncul

Delapan kata ini dipakai di hampir setiap halaman. Kenali sekarang supaya tidak
tersandung nanti:

| Istilah | Arti sederhana |
| --- | --- |
| **Host** | Perangkat ujung yang memakai jaringan: laptop, ponsel, server, kamera IP |
| **Node** | Titik apa pun di jaringan — host *maupun* perangkat perantara (switch, router) |
| **Server** | Host yang **menyediakan** layanan (menunggu diminta) |
| **Client** | Host yang **meminta** layanan (memulai percakapan) |
| **Protokol** | Kesepakatan format & urutan pesan — "bahasa" yang dipahami kedua pihak |
| **Paket** | Potongan data + header alamat; satuan yang berpindah-pindah di jaringan |
| **Interface** | "Pintu" sebuah perangkat ke jaringan: port Ethernet, radio Wi-Fi, modem |
| **Gateway** | Router yang menjadi pintu keluar dari jaringan lokalmu ke jaringan lain |

### Client–server vs peer-to-peer

Dua pola hubungan antar-host:

- **Client–server** — peran tegas: server selalu siap melayani (web, email,
  database), client datang meminta. Mudah dikelola dan diamankan; hampir semua
  layanan internet memakai pola ini.
- **Peer-to-peer (P2P)** — semua host setara, saling melayani sekaligus
  meminta: berbagi file antar-laptop, BitTorrent, panggilan video langsung
  antar-perangkat. Tanpa titik pusat, tapi lebih sulit diatur.

Satu perangkat bisa memainkan dua peran sekaligus: laptopmu adalah *client*
saat membuka situs ini, dan *server* saat teman mengakses file yang kamu
bagikan.

## Jenis jaringan berdasarkan cakupan

| Jenis | Kepanjangan | Cakupan | Contoh |
| --- | --- | --- | --- |
| PAN | Personal Area Network | ± beberapa meter | Bluetooth earbuds ke ponsel |
| LAN | Local Area Network | Satu gedung/ruangan | Jaringan kantor, lab sekolah |
| WLAN | Wireless LAN | Satu gedung/ruangan | Wi-Fi rumah |
| MAN | Metropolitan Area Network | Satu kota | Jaringan antar-kampus universitas |
| WAN | Wide Area Network | Antarkota s.d. global | Internet, jaringan antar-cabang bank |

::: tip Hubungan dengan satelit
Satelit adalah salah satu teknologi **WAN**: ia menghubungkan lokasi-lokasi yang
terlalu jauh atau terlalu terpencil untuk kabel. Sebuah kantor di pedalaman yang
tersambung lewat [VSAT](/satelit/vsat) tetap punya LAN biasa di dalamnya — satelit
hanya menggantikan "kabel panjang" ke dunia luar.
:::

## Topologi jaringan

Topologi adalah bentuk hubungan antar-perangkat. Ini menentukan biaya kabel,
ketahanan terhadap kegagalan, dan kemudahan menambah perangkat.

| Topologi | Bentuk | Kelebihan | Kelemahan |
| --- | --- | --- | --- |
| Bus | Semua perangkat menempel di satu kabel utama | Murah, sederhana | Satu kabel putus, semua lumpuh; tabrakan data |
| Ring | Perangkat membentuk lingkaran | Deterministik, adil | Satu simpul gagal bisa memutus ring |
| Star | Semua perangkat terhubung ke satu titik pusat (switch) | Mudah dikelola, gagal satu kabel hanya memutus satu perangkat | Titik pusat jadi *single point of failure* |
| Mesh | Setiap perangkat terhubung ke banyak perangkat lain | Sangat tahan gagal | Mahal, rumit |
| Tree/Hierarki | Gabungan star bertingkat | Skalabel | Bergantung pada tingkat di atasnya |

```text
Bus                    Star                   Mesh (penuh)
A──B──C──D             A   B                  A ─── B
   (satu kabel          \ /                   │ ╲ ╱ │
    bersama)        D──[SW]──C                │ ╱ ╲ │
                         │                    C ─── D
Ring                     E
A──B                                          setiap simpul
│  │                kegagalan 1 kabel         terhubung ke
D──C                hanya memutus             semua simpul
                    1 perangkat               lain
```

Cara membaca tabel di atas dalam praktik: pertanyaannya selalu **"kalau titik
ini mati, siapa yang ikut mati?"**. Pada star, matinya satu kabel hanya
memutus satu perangkat — tapi matinya switch pusat memutus semuanya. Pada mesh,
hampir tidak ada titik yang kematiannya fatal — itulah kenapa topologi inti
internet (dan konstelasi satelit) memilihnya walau mahal.

Jaringan modern hampir selalu **star** di tingkat akses (semua komputer ke
switch) dan **mesh parsial** di tingkat inti (antar-router, antar-ISP). Internet
secara keseluruhan adalah mesh raksasa — dan konstelasi satelit LEO seperti
Starlink membentuk mesh yang benar-benar bergerak di angkasa, dengan
*inter-satellite link* laser antar-satelit.

## Perangkat jaringan

Perangkat-perangkat ini akan dibahas mendalam di halamannya masing-masing.
Kenali dulu perannya:

| Perangkat | Bekerja di lapisan | Tugas singkat |
| --- | --- | --- |
| Repeater / Hub | Fisik (L1) | Menguatkan/meneruskan sinyal ke semua port, tanpa berpikir |
| Switch | Data Link (L2) | Meneruskan *frame* hanya ke port tujuan berdasarkan alamat MAC → [Switching](/networking/switching) |
| Router | Network (L3) | Memilih jalur antar-jaringan berdasarkan alamat IP → [Routing](/networking/routing) |
| Firewall | L3–L7 | Menyaring trafik sesuai aturan keamanan → [Firewall](/networking/firewall), [Keamanan](/networking/keamanan) |
| Access Point | L1–L2 | Menjembatani perangkat nirkabel ke jaringan kabel |
| Modem | L1 | Mengubah sinyal digital ↔ analog (termasuk **modem satelit** di terminal VSAT) |

## Media transmisi

Data selalu menumpang pada medium fisik:

- **Kabel tembaga (UTP/STP)** — murah, umum untuk LAN; kategori menentukan
  kecepatan (Cat5e: 1 Gbps, Cat6a: 10 Gbps) dengan jarak maksimum ±100 m.
- **Kabel koaksial** — TV kabel, sambungan antena; juga dipakai antara antena
  parabola dan modem satelit (via LNB).
- **Serat optik** — cahaya di dalam kaca; kapasitas terabit dan jarak puluhan
  hingga ribuan kilometer. Tulang punggung internet, termasuk kabel laut.
- **Gelombang radio** — Wi-Fi, seluler, *microwave link*, dan
  [komunikasi satelit](/satelit/komunikasi). Tanpa kabel, tapi tunduk pada
  aturan [spektrum frekuensi](/satelit/frekuensi-band).

::: info Kabel laut vs satelit
±99% trafik internet antarbenua lewat kabel laut serat optik, bukan satelit —
kapasitasnya jauh lebih besar dan latensinya lebih kecil. Satelit unggul justru
di tempat yang tidak terjangkau kabel: pulau terpencil, kapal, pesawat, dan
daerah bencana ketika infrastruktur darat lumpuh.
:::

## Tiga ukuran kinerja yang wajib dipahami

**Bandwidth** — lebar pipa: berapa bit per detik *maksimal* yang bisa lewat.
Satuan bps, Mbps, Gbps.

**Throughput** — aliran nyata: berapa bit per detik yang *benar-benar* sampai.
Selalu ≤ bandwidth karena ada overhead protokol, antrean, dan retransmisi.

**Latensi** — waktu tempuh: berapa lama satu bit dari sumber sampai tujuan.
Diukur dalam milidetik; sering dinyatakan sebagai RTT (*round-trip time*,
pergi-pulang).

```text
Analogi jalan tol:
bandwidth  = jumlah lajur
throughput = mobil yang benar-benar lolos per jam (macet ikut dihitung)
latensi    = lama perjalanan satu mobil dari gerbang ke gerbang
```

Ketiganya independen. Link satelit GEO bisa punya bandwidth ratusan Mbps tetapi
latensi RTT ±500 ms — karena sinyal harus naik-turun 35.786 km dua kali. Inilah
alasan bab [Komunikasi Satelit](/satelit/komunikasi) membahas TCP secara khusus.

### Dua ukuran pelengkap: jitter dan packet loss

- **Jitter** — variasi latensi antar-paket. Latensi 100 ms yang *stabil* masih
  nyaman untuk telepon; latensi 50 ms yang melonjak-lonjak ke 200 ms membuat
  suara terputus-putus. Musuh utama VoIP dan video call.
- **Packet loss** — persentase paket yang hilang di jalan (antrean penuh,
  interferensi radio, kabel buruk). Loss 1% terdengar kecil, tapi cukup untuk
  membuat TCP menurunkan kecepatannya drastis.

### Contoh dikerjakan: berapa lama unduhan 100 MB?

Link 100 Mbps, file 100 MB (megabyte, bukan megabit):

1. 100 MB = 800 megabit (1 byte = 8 bit — jebakan klasik!).
2. Waktu ideal = 800 Mb ÷ 100 Mbps = **8 detik**.
3. Kenyataan: overhead header TCP/IP (±3–5%), jeda *slow start*, dan antrean
   membuat throughput riil mungkin 90 Mbps → ±9 detik. Di link satelit GEO,
   tambahkan lagi beberapa detik karena TCP butuh banyak RTT untuk mencapai
   kecepatan penuh.

Pola pikirnya yang penting: **bandwidth menentukan batas atas; latensi dan
loss menentukan seberapa dekat kamu ke batas itu**.

## Cek pemahaman

1. Wi-Fi rumahmu termasuk jenis jaringan apa? <br>→ **WLAN** — dan koneksi
   rumah ke ISP adalah bagian dari **WAN**.
2. Kenapa jaringan kantor memakai topologi star, bukan mesh? <br>→ Biaya:
   mesh butuh kabel & port ke setiap perangkat lain. Star cukup satu kabel per
   perangkat ke switch — kegagalan satu kabel pun hanya memutus satu perangkat.
3. Perangkat apa yang memisahkan jaringan lokalmu dari internet? <br>→
   **Router** (gateway) — sering digabung dengan firewall dan modem dalam satu
   kotak "router rumah".
4. Link 50 Mbps dengan RTT 600 ms vs link 10 Mbps dengan RTT 20 ms — mana yang
   lebih nyaman untuk video call? <br>→ Yang kedua: video call butuh latensi
   rendah dan stabil; bandwidth 10 Mbps sudah jauh lebih dari cukup.

## Peta modul ini

1. [Model OSI](/networking/model-osi) — kerangka 7 lapisan untuk memahami semuanya
2. [Model TCP/IP](/networking/model-tcp-ip) — model 4 lapisan yang benar-benar dipakai internet
3. [IP Addressing & Subnetting](/networking/subnetting) — alamat, prefix, dan cara membagi jaringan
4. [Routing](/networking/routing) — bagaimana paket menemukan jalannya
5. [Switching & VLAN](/networking/switching) — lalu lintas di dalam satu jaringan lokal
6. [Protokol Jaringan](/networking/protokol) — TCP, UDP, DNS, DHCP, HTTP, dan kawan-kawan
7. [Keamanan Jaringan](/networking/keamanan) — ancaman dan pertahanannya
8. [Firewall — Panduan Lengkap](/networking/firewall) — dari packet filter hingga NGFW, arsitektur, NAT, logging, performa, skenario deployment
9. [Keamanan Lanjutan](/networking/keamanan-lanjut) — manajemen risiko, respon insiden, SIEM, standar keamanan
