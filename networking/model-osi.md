---
title: Model OSI
---

# Model OSI

Model OSI (*Open Systems Interconnection*) adalah kerangka berpikir 7 lapisan
yang diterbitkan ISO pada 1984 untuk menjelaskan bagaimana komunikasi data
bekerja. Internet nyata memakai [model TCP/IP](/networking/model-tcp-ip), tapi
OSI tetap menjadi **bahasa bersama** para network engineer: ketika seseorang
bilang "ini masalah layer 2", semua orang paham maksudnya.

## Ide dasarnya: pembagian tanggung jawab

Mengirim data dari satu aplikasi ke aplikasi lain melibatkan banyak pekerjaan
berbeda: menyajikan data, menjaga percakapan, memecah data, mengalamatkan,
memilih jalur, mengakses medium, sampai menggetarkan elektron atau memancarkan
gelombang radio. OSI memecah pekerjaan itu menjadi 7 lapisan, dengan aturan main:

- Setiap lapisan **hanya melayani lapisan di atasnya** dan **hanya memakai jasa
  lapisan di bawahnya**.
- Lapisan yang sama di dua komputer berbeda "berbicara" satu sama lain lewat
  protokol — seolah-olah langsung, padahal melalui semua lapisan di bawahnya.

::: info Analogi: dua CEO berkirim dokumen
CEO Jakarta ingin mengirim dokumen ke CEO Singapura. Ia tidak mengurus amplop —
ia menyerahkannya ke sekretaris (presentation: merapikan format), yang
menyerahkan ke ekspedisi internal (session/transport: mencatat dan memastikan
sampai), yang menyerahkan ke kurir (network: memilih rute antar-kota), yang
menyetir lewat jalan raya (data link + physical). Di Singapura proses berjalan
terbalik ke atas. **Kedua CEO merasa berbicara langsung** — padahal pesan
menuruni dan menaiki seluruh tumpukan. Setiap peran hanya perlu memahami
pekerjaannya sendiri dan antarmuka dengan peran di atas/bawahnya. Persis itulah
pelapisan.
:::

Manfaat praktis pembagian ini: **setiap lapisan bisa diganti tanpa mengubah
yang lain**. Wi-Fi bisa diganti kabel (L1–2 berubah) tanpa aplikasi sadar;
HTTP bisa diganti protokol lain tanpa menyentuh kabel. Inilah alasan internet
bisa berevolusi selama 50 tahun tanpa pernah "diinstal ulang".

## Tujuh lapisan

| # | Lapisan | Satuan data (PDU) | Tanggung jawab | Contoh protokol/perangkat |
| --- | --- | --- | --- | --- |
| 7 | Application | Data | Antarmuka layanan jaringan untuk aplikasi | HTTP, DNS, SMTP, FTP |
| 6 | Presentation | Data | Format, enkripsi, kompresi | TLS, JPEG, ASCII/UTF-8 |
| 5 | Session | Data | Membuka, menjaga, menutup sesi dialog | NetBIOS, RPC, sesi TLS |
| 4 | Transport | Segment | Pengiriman ujung-ke-ujung antar-proses, kendali aliran | TCP, UDP |
| 3 | Network | Packet | Pengalamatan logis & pemilihan jalur antar-jaringan | IP, ICMP; **router** |
| 2 | Data Link | Frame | Pengiriman antar-tetangga di satu medium, alamat fisik | Ethernet, Wi-Fi (MAC); **switch** |
| 1 | Physical | Bit | Transmisi bit di medium: tegangan, cahaya, gelombang radio | UTP, serat optik, **RF satelit** |

Jembatan keledai populer (dari lapisan 7 ke 1):
**A**njing **P**intar **S**uka **T**idur **N**yenyak **D**i **P**ojokan.

### Layer 1 — Physical

Segala hal yang bisa kamu sentuh atau ukur dengan alat: konektor, kabel,
level tegangan, panjang gelombang cahaya, frekuensi radio, teknik modulasi.
Pertanyaan khas layer 1: *berapa volt mewakili bit 1? berapa lama satu bit
"menyala"? konektornya RJ45 atau LC?* Masalah khasnya pun fisik: kabel putus,
konektor longgar, interferensi, sinyal melemah karena jarak.
Di dunia satelit, hampir seluruh isi bab
[Frekuensi & Band](/satelit/frekuensi-band) dan sebagian
[Komunikasi Satelit](/satelit/komunikasi) (modulasi, coding) adalah urusan
layer 1.

### Layer 2 — Data Link

Mengantarkan *frame* antar-perangkat yang berada di **medium yang sama** —
komputer ke switch, ponsel ke access point. Di sinilah alamat **MAC** (48-bit,
ditulis `AA:BB:CC:DD:EE:FF`) bekerja. Layer 2 juga mengatur siapa boleh
"berbicara" kapan (*media access control*) dan mendeteksi frame rusak lewat
FCS/CRC. Dibahas tuntas di [Switching & VLAN](/networking/switching).

### Layer 3 — Network

Mengantarkan *packet* **antar-jaringan** yang berbeda. Alamat IP hidup di sini,
begitu pula keputusan routing. Router adalah perangkat layer 3. Dibahas di
[IP Addressing](/networking/subnetting) dan [Routing](/networking/routing).

### Layer 4 — Transport

Mengantarkan data **antar-proses/aplikasi** (dibedakan lewat *port*), bukan
sekadar antar-mesin. TCP menambahkan keandalan (urutan, retransmisi,
kendali kemacetan); UDP memilih kecepatan tanpa jaminan. Dibahas di
[Protokol Jaringan](/networking/protokol#tcp-vs-udp).

### Layer 5–7 — Session, Presentation, Application

Di dunia nyata ketiganya menyatu di dalam aplikasi dan protokolnya. TLS,
misalnya, mengerjakan urusan sesi *dan* enkripsi sekaligus. Karena itulah model
TCP/IP melebur ketiganya menjadi satu lapisan Application.

## Enkapsulasi: perjalanan turun dan naik

Saat data dikirim, setiap lapisan **membungkus** data dari lapisan di atasnya
dengan header miliknya (layer 2 juga menambah *trailer*). Proses sebaliknya —
membuka bungkus lapis demi lapis — terjadi di penerima.

```text
PENGIRIM                                        PENERIMA
Aplikasi   [data]                               [data]         Aplikasi
Transport  [TCP|data]                           [TCP|data]     Transport
Network    [IP|TCP|data]                        [IP|TCP|data]  Network
Data Link  [ETH|IP|TCP|data|FCS]  ──medium──▶  [ETH|IP|TCP|data|FCS]
Physical   101101110101... ──────────────────▶ 101101110101...
```

Perhatikan konsekuensinya: **switch** hanya membuka bungkus sampai layer 2
(cukup untuk membaca MAC tujuan), **router** membuka sampai layer 3 (membaca IP
tujuan), dan hanya komputer tujuan yang membuka semuanya sampai data asli.

## Berpikir per lapisan saat troubleshooting

Kekuatan terbesar OSI adalah sebagai metode debugging — periksa dari bawah:

1. **L1** — Kabel tercolok? Lampu port menyala? Sinyal Wi-Fi/satelit cukup kuat?
2. **L2** — Terhubung ke switch/AP yang benar? VLAN sesuai? MAC terdaftar?
3. **L3** — Punya IP yang benar? Bisa `ping` gateway? Rute ke tujuan ada?
4. **L4** — Port tujuan terbuka? Firewall meloloskan?
5. **L5–7** — Aplikasi/layanannya sendiri sehat? Sertifikat TLS valid? DNS benar?

### Studi kasus mini: "internetnya mati!"

Laporan pengguna hampir selalu berbunyi layer 7 ("situs tidak bisa dibuka"),
tapi akarnya bisa di lapisan mana pun. Jalankan tangga dari bawah:

| Pemeriksaan | Hasil | Kesimpulan |
| --- | --- | --- |
| Lampu port switch | Menyala | L1 aman — kabel & sinyal ada |
| `ip addr` | Dapat IP `169.254.x.x` | **Tersangka ketemu**: DHCP gagal (L2/L3) |
| Cek switch | Port ternyata dipindah ke VLAN lain | Akar masalah: L2 |

Tanpa metode ini orang cenderung "restart semuanya dan berdoa". Dengan metode
ini kamu berhenti tepat di lapisan yang bermasalah — hemat waktu, dan kamu
tahu *kenapa* solusinya berhasil.

```bash
# alat bantu cepat per lapisan
ip link          # L1/L2: status antarmuka
ip addr          # L3: alamat IP
ping 192.0.2.1   # L3: keterjangkauan
traceroute ...   # L3: jalur antar-router
ss -tlnp         # L4: port yang mendengarkan
curl -v https:// # L7: transaksi aplikasi lengkap
```

::: tip OSI di link satelit
Link satelit menggantikan **layer 1 dan 2** saja. Paket IP-mu tidak peduli ia
menumpang serat optik atau transponder di orbit GEO — itulah keindahan
pelapisan. Yang bocor ke atas hanyalah *karakteristik*-nya: latensi tinggi dan
kemungkinan error yang lebih besar, yang lalu memaksa layer 4 (TCP)
beradaptasi. Lihat [Komunikasi Satelit](/satelit/komunikasi#dampak-latensi-pada-tcp).
:::

## OSI vs kenyataan

Kritik yang adil: OSI lahir dari komite, bukan dari kode. Protokol OSI asli
(X.400, CLNP) kalah oleh TCP/IP yang lebih pragmatis. Batas layer 5–7 kabur,
dan beberapa teknologi menolak dikotakkan (MPLS sering disebut "layer 2,5";
tunneling menumpuk lapisan di atas lapisan). Gunakan OSI sebagai **peta**,
bukan sebagai kitab suci — dan lanjutkan ke model yang benar-benar dipakai:
[Model TCP/IP](/networking/model-tcp-ip).

## Cek pemahaman

1. Switch membaca alamat apa, dan router membaca alamat apa? <br>→ Switch:
   **MAC** (layer 2). Router: **IP** (layer 3).
2. `ping` ke gateway berhasil tapi situs tetap tidak terbuka. Lapisan mana yang
   sudah terbukti sehat, dan ke mana pemeriksaan berikutnya? <br>→ L1–L3 sampai
   gateway sehat. Berikutnya: rute ke luar, DNS, lalu L4–L7 (port, TLS,
   aplikasi).
3. TLS bekerja di lapisan mana? <br>→ Di wilayah abu-abu L5–L6 — contoh nyata
   bahwa batas lapisan atas OSI kabur; model TCP/IP meleburnya ke Application.
4. Mengganti Wi-Fi dengan kabel LAN mengubah lapisan berapa saja? <br>→ Hanya
   **L1–L2**. IP, TCP, dan aplikasimu tidak berubah sama sekali — bukti nyata
   manfaat pelapisan.

---

**Praktik:** cara menu RouterOS dipetakan berdasarkan lapisan OSI — layer 2 di `/interface/bridge`, layer 3 di `/ip` dan `/routing` — dijelaskan di [Pengantar RouterOS](/mikrotik/#arsitektur-menu-konfigurasi-sebagai-pohon).
