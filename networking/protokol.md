---
title: Protokol Jaringan
---

# Protokol Jaringan

Protokol adalah kesepakatan format dan urutan pesan antara dua pihak yang
berkomunikasi. Halaman ini membedah protokol-protokol yang menopang pengalaman
internet sehari-hari: TCP, UDP, DNS, DHCP, HTTP/HTTPS, dan beberapa protokol
pendukung yang bekerja di belakang layar.

## TCP vs UDP

Dua kuda beban lapisan transport — sudah diperkenalkan di
[Model TCP/IP](/networking/model-tcp-ip#lapisan-transport-ujung-ke-ujung),
di sini kita pertajam perbandingannya:

| Aspek | TCP | UDP |
| --- | --- | --- |
| Koneksi | Ya (three-way handshake) | Tidak |
| Jaminan sampai | Ya (ACK + retransmisi) | Tidak |
| Urutan terjaga | Ya | Tidak |
| Kendali kemacetan | Ya | Tidak |
| Overhead header | 20–60 byte | 8 byte |
| Cocok untuk | Web, email, transfer file, SSH | VoIP, video call, game, DNS, NTP |

Aturan praktis: kalau data **harus lengkap** (file, halaman web), pakai TCP.
Kalau data **harus segar** dan yang telat lebih baik dibuang (suara, video
langsung, posisi pemain game), pakai UDP — aplikasilah yang menangani sisanya.

## DNS

DNS (*Domain Name System*) menerjemahkan nama (`netsat.aderamdani.web.id`)
menjadi alamat IP. Tanpa DNS, internet tetap jalan — tapi kamu harus hafal
angka.

### Hierarki dan proses resolusi

DNS adalah basis data terdistribusi berbentuk pohon: **root** → **TLD**
(`.id`, `.com`) → **domain** (`web.id`, `aderamdani.web.id`) → seterusnya.

```
Kamu → resolver (ISP/publik) ── 1 ──▶ root      : "tanya server .id"
                              ── 2 ──▶ .id/web.id: "tanya NS aderamdani.web.id"
                              ── 3 ──▶ NS domain : "netsat = 203.0.113.5"
       ◀── jawaban (di-cache sesuai TTL) ──┘
```

Resolver menyimpan jawaban di *cache* selama TTL rekaman — karena itulah
perubahan DNS "butuh waktu menyebar".

### Jenis rekaman penting

| Rekaman | Isi | Contoh |
| --- | --- | --- |
| A | Nama → IPv4 | `netsat A 203.0.113.5` |
| AAAA | Nama → IPv6 | `netsat AAAA 2001:db8::5` |
| CNAME | Nama → nama lain (alias) | `netsat CNAME xxx.vercel-dns.com` |
| MX | Server email domain | `@ MX 10 mail.example.com` |
| TXT | Teks bebas (verifikasi, SPF/DKIM) | `"v=spf1 ..."` |
| NS | Server otoritatif zona | `@ NS ns1.example-dns.com` |

Situs ini sendiri hidup dari satu rekaman **CNAME**:
`netsat.aderamdani.web.id → dns Vercel`, persis pola di tabel.

```bash
dig netsat.aderamdani.web.id +short   # uji resolusi dari terminal
```

## DHCP

DHCP (*Dynamic Host Configuration Protocol*) memberi perangkat konfigurasi
jaringan secara otomatis: alamat IP, subnet mask, gateway, dan server DNS.
Prosesnya empat langkah — **DORA**:

```
Klien                                   Server DHCP
  │ ── DISCOVER (broadcast: ada server?) ──▶
  │ ◀─ OFFER    (tawaran: 192.168.1.50)  ──
  │ ── REQUEST  (saya ambil yang itu)    ──▶
  │ ◀─ ACK      (sah, sewa 24 jam)       ──
```

Alamat bersifat **sewa** (*lease*); klien memperpanjang di tengah masa sewa.
Kalau tidak ada server DHCP yang menjawab, perangkat memberi dirinya alamat
darurat `169.254.x.x` — tanda klasik "jaringan bermasalah" saat troubleshooting.

## HTTP dan HTTPS

HTTP (*HyperText Transfer Protocol*) adalah protokol permintaan-balasan di
balik web:

```http
GET /networking/protokol HTTP/1.1
Host: netsat.aderamdani.web.id

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>...
```

Metode utama: `GET` (ambil), `POST` (kirim), `PUT`/`PATCH` (ubah), `DELETE`.
Kode status: `2xx` sukses, `3xx` pengalihan, `4xx` salah dari klien
(404 = tidak ada), `5xx` salah dari server.

### HTTPS = HTTP + TLS

TLS menambahkan tiga jaminan: **kerahasiaan** (enkripsi), **integritas**
(data tak diubah di jalan), dan **autentikasi** (sertifikat membuktikan kamu
bicara dengan server asli, dijamin rantai *Certificate Authority*). Handshake
TLS 1.3 hanya butuh 1 RTT sebelum data mengalir.

### Evolusi versi

| Versi | Transport | Pembeda utama |
| --- | --- | --- |
| HTTP/1.1 | TCP | Satu permintaan menunggu yang lain (head-of-line blocking) |
| HTTP/2 | TCP | Multiplexing banyak permintaan dalam satu koneksi |
| HTTP/3 | **QUIC (UDP)** | Handshake lebih singkat, tanpa HOL blocking di transport |

::: tip Hitung RTT-mu
Membuka satu halaman HTTPS baru butuh minimal: 1 RTT (TCP) + 1 RTT (TLS 1.3)
+ 1 RTT (HTTP) ≈ **3 RTT** sebelum byte pertama tampil. Di serat optik
antarkota (RTT 20 ms) itu 60 ms — tak terasa. Di link
[GEO](/satelit/orbit#geo-geostationary-orbit) (RTT 500 ms) itu **1,5 detik**
hanya untuk memulai. HTTP/3 dan *TLS session resumption* memangkas ini —
contoh nyata desain protokol modern yang "sadar latensi".
:::

## Protokol pendukung yang jarang disadari

- **ICMP** — kurir pesan kontrol IP: "tujuan tak terjangkau", "TTL habis".
  `ping` dan `traceroute` dibangun di atasnya.
- **NTP** — sinkronisasi jam. Sepele? Sertifikat TLS, log keamanan, dan
  sistem terdistribusi rusak tanpa jam yang akur. Sumber waktu utamanya:
  jam atom, termasuk yang dibawa [satelit GNSS](/satelit/orbit#meo-medium-earth-orbit).
- **SMTP / IMAP** — kirim dan baca email antar-server dan ke klien.
- **SSH** — remote shell terenkripsi, port 22; juga tunneling dan transfer
  file (SFTP).

## Melihat protokol dengan mata kepala

Cara terbaik memahami protokol adalah menyaksikannya:

```bash
dig +trace example.com        # saksikan resolusi DNS dari root ke bawah
curl -v https://example.com   # saksikan handshake TLS + transaksi HTTP
ss -tunap                     # koneksi TCP/UDP yang sedang hidup
```

Untuk menyelam lebih dalam, **Wireshark** menampilkan isi tiap paket lapis per
lapis — ARP, DHCP DORA, TCP handshake, semua yang dibahas modul ini terlihat
telanjang di sana. Sangat dianjurkan dicoba minimal sekali.

Protokol-protokol ini dirancang di era jaringan yang saling percaya. Apa yang
terjadi ketika ada pihak yang berniat jahat? Lanjut ke
[Keamanan Jaringan](/networking/keamanan).
