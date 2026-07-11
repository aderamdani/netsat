---
title: Model TCP/IP
---

# Model TCP/IP

Kalau [OSI](/networking/model-osi) adalah teori yang rapi, TCP/IP adalah praktik
yang menang. Model ini lahir dari proyek ARPANET (cikal bakal internet) dan
didokumentasikan dalam RFC 1122. Setiap paket yang lewat internet hari ini —
termasuk yang menumpang [transponder satelit](/satelit/komunikasi) — mengikuti
model ini.

## Empat lapisan

| Lapisan TCP/IP | Padanan OSI | Protokol utama | Satuan data |
| --- | --- | --- | --- |
| Application | 5–7 | HTTP, DNS, SMTP, SSH, TLS | Data / message |
| Transport | 4 | TCP, UDP, QUIC | Segment / datagram |
| Internet | 3 | IP (v4/v6), ICMP | Packet |
| Link (Network Access) | 1–2 | Ethernet, Wi-Fi, PPP, DVB-S2 | Frame |

Perbedaan filosofis dengan OSI: TCP/IP tidak memaksakan pemisahan
session/presentation, dan menyerahkan seluruh urusan medium fisik ke lapisan
Link — "pokoknya sampaikan frame ini ke tetangga, terserah caranya".

::: info DVB-S2 itu apa?
Standar lapisan Link/Physical untuk siaran dan data lewat satelit — analog
dengan Ethernet, tapi mediumnya transponder di orbit. Paket IP dibungkus frame
DVB-S2 persis seperti dibungkus frame Ethernet di kabel. Detailnya di
[Komunikasi Satelit](/satelit/komunikasi#modulasi-dan-coding).
:::

## Lapisan Internet: IP

IP (*Internet Protocol*) punya satu tugas: mengantarkan paket dari alamat
sumber ke alamat tujuan, **melintasi jaringan apa pun di tengahnya**. Sifatnya:

- **Connectionless** — tiap paket berdiri sendiri, tidak ada "panggilan" yang
  dibuka dulu.
- **Best effort** — IP tidak menjamin paket sampai, tidak menjamin urutan,
  tidak menjamin bebas duplikat. Jaminan adalah urusan lapisan di atasnya.

### Anatomi header IPv4

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-------+-------+---------------+-------------------------------+
|Versi  | IHL   |    DSCP/ECN   |        Total Length           |
+-------+-------+---------------+-----+-------------------------+
|         Identification        |Flags|    Fragment Offset      |
+---------------+---------------+-----+-------------------------+
|      TTL      |   Protocol    |       Header Checksum         |
+---------------+---------------+-------------------------------+
|                     Source IP Address                         |
+---------------------------------------------------------------+
|                  Destination IP Address                       |
+---------------------------------------------------------------+
```

*Jelajahi setiap field header IPv4 di atas melalui komponen interaktif ini:*
<IpHeaderInteractive />

Field yang paling sering kamu temui dalam praktik:

- **TTL** (*Time To Live*) — berkurang 1 di tiap router; saat mencapai 0 paket
  dibuang. Mencegah paket berputar selamanya. `traceroute` bekerja dengan
  sengaja mengirim paket ber-TTL kecil.
- **Protocol** — isi paket ini apa: 6 = TCP, 17 = UDP, 1 = ICMP.
- **DSCP** — penanda prioritas untuk QoS; penting di link satelit yang
  bandwidth-nya mahal.

### MTU dan fragmentasi

Setiap medium punya ukuran frame maksimum — **MTU** (*Maximum Transmission
Unit*); Ethernet standarnya 1500 byte. Paket yang lebih besar dari MTU jalur
harus **difragmentasi** (dipecah) oleh router, atau dibuang jika paket
menyalakan flag DF (*Don't Fragment*). Fragmentasi itu mahal dan rapuh,
sehingga host modern memakai **Path MTU Discovery**: sengaja mengirim dengan
DF, membaca pesan ICMP "terlalu besar", lalu mengecilkan paketnya sendiri.

Gejala klasik masalah MTU: *ping kecil jalan, tapi situs tertentu menggantung
selamanya* — sering muncul saat ada tunnel VPN (yang menambah header dan
memakan MTU efektif).

### IPv6 secara singkat

Alamat 128-bit (`2001:db8::1`), header lebih sederhana, tanpa NAT sebagai
keharusan, *autoconfiguration* bawaan. Konsep routing dan subnetting-nya sama —
yang kamu pelajari di [Subnetting](/networking/subnetting) berlaku juga untuk
IPv6, hanya angkanya lebih besar.

## Lapisan Transport: ujung ke ujung

IP mengantar paket **antar-mesin**; transport mengantar data **antar-aplikasi**.
Pembeda aplikasi adalah **nomor port** (16-bit, 0–65535):

| Port | Layanan |
| --- | --- |
| 22 | SSH |
| 53 | DNS |
| 80 / 443 | HTTP / HTTPS |
| 123 | NTP |

Satu koneksi diidentifikasi unik oleh 4-tuple:
`(IP sumber, port sumber, IP tujuan, port tujuan)`.

Port 0–1023 disebut *well-known ports* dan dicadangkan untuk layanan baku.
Sisi klien memakai **ephemeral port** — nomor acak tinggi (±49152–65535) yang
dipinjam selama koneksi berlangsung lalu dikembalikan. Karena 4-tuple harus
unik, satu laptop bisa membuka puluhan ribu koneksi sekaligus ke server yang
sama tanpa saling bertabrakan.

### TCP: andal, berurutan, kenal kemacetan

TCP membuka koneksi lewat **three-way handshake**:

```text
Klien                         Server
  │ ── SYN  (seq=x) ────────────▶ │
  │ ◀─ SYN-ACK (seq=y, ack=x+1) ─ │
  │ ── ACK  (ack=y+1) ──────────▶ │
  │        koneksi terbentuk      │
```

*Simulasikan proses pembentukan koneksi:*
<TcpInteractiveDemo mode="handshake" />

Setelah itu setiap byte diberi nomor urut, penerima mengirim ACK, dan data yang
hilang dikirim ulang. Begini wujudnya dalam satu pertukaran kecil:

```text
Klien mengirim 1000 byte  : seq=1..1000
Server membalas           : ack=1001   ("sudah kuterima s.d. byte 1000")
Klien mengirim 1000 lagi  : seq=1001..2000     ✖ hilang di jalan
Klien mengirim 1000 lagi  : seq=2001..3000
Server membalas           : ack=1001   (tetap! "aku masih menunggu byte 1001")
Klien menyadari, kirim ulang seq=1001..2000 → aliran pulih
```

*Simulasikan kehilangan paket di tengah jalan:*
<TcpInteractiveDemo mode="recovery" />

Pengirim tidak menunggu ACK satu per satu — ia boleh "mengutang" sejumlah byte
yang belum di-ACK, sebanyak ukuran **window**. Makin besar window, makin penuh
pipa terisi. Dua mekanisme kendali membuat TCP "sopan":

- **Flow control** (jendela penerima) — jangan membanjiri penerima.
- **Congestion control** (slow start, AIMD) — jangan membanjiri jaringan.
  TCP mulai pelan dan menaikkan kecepatan setiap RTT.

::: warning Kenapa ini penting untuk satelit
Kecepatan TCP naik "setiap RTT". Di link GEO, satu RTT ≈ 500 ms — 10× lipat
RTT antarkota. Akibatnya TCP butuh waktu jauh lebih lama mencapai kecepatan
penuh, dan *throughput* maksimum dibatasi rumus `window / RTT`. Solusi dunia
VSAT (PEP, *TCP acceleration*) dibahas di
[Komunikasi Satelit](/satelit/komunikasi#dampak-latensi-pada-tcp).
:::

### UDP: kirim dan lupakan

UDP hanya menambahkan port + checksum di atas IP. Tanpa handshake, tanpa
retransmisi, tanpa urutan. Justru itu kekuatannya untuk aplikasi yang lebih
mementingkan **kesegaran** daripada **kelengkapan**: VoIP, video call, game
online, DNS, NTP, dan streaming telemetri satelit.

### QUIC: transport generasi baru

QUIC (dipakai HTTP/3) berjalan di atas UDP tapi menyediakan keandalan ala TCP,
enkripsi bawaan, dan handshake yang lebih singkat (0–1 RTT). Lahir justru untuk
memangkas dampak latensi — perbaikan yang paling terasa di jalur ber-RTT tinggi.

## Lapisan Application

Tempat protokol yang berbicara bahasa manusia-mesin: HTTP untuk web, DNS untuk
nama, SMTP untuk surel, SSH untuk remote shell. Dibahas satu per satu di
[Protokol Jaringan](/networking/protokol).

## Mengikuti satu paket dari laptop ke server

Rangkuman seluruh model dalam satu perjalanan — laptop di Jakarta membuka
`https://example.com` (server di Singapura):

1. **Application**: browser menyusun permintaan HTTP, TLS mengenkripsinya.
2. **Transport**: TCP memecah menjadi segment, memberi nomor urut, port
   sumber 51234 → tujuan 443.
3. **Internet**: IP membungkus dengan alamat `192.0.2.10 → 203.0.113.5`.
4. **Link**: Ethernet/Wi-Fi membungkus dengan MAC laptop → MAC router rumah.
5. Router rumah membuka frame, membaca IP tujuan, membungkus ulang dengan
   frame baru ke arah ISP — begitu seterusnya router demi router.
6. Di server: bungkus dibuka lapis demi lapis, TCP merakit ulang urutan byte,
   TLS mendekripsi, aplikasi web membaca permintaan. Balasan menempuh proses
   yang sama ke arah sebaliknya.

Frame berganti-ganti di setiap hop (Ethernet → serat optik ISP → mungkin
DVB-S2 di link satelit → Ethernet lagi), tapi **paket IP dan segment TCP tetap
utuh dari ujung ke ujung**. Itulah inti desain internet: *IP over everything*.

## Cek pemahaman

<QuizBox 
  question="IP tidak menjamin paket sampai. Lalu kenapa unduhan file tidak pernah bolong isinya?"
  :options="['Karena internet kabel sudah sangat andal', 'Karena router menyimpan cadangan paket', 'Karena ada TCP di atasnya yang meminta kirim ulang', 'Karena DNS otomatis memperbaikinya']"
  :correctIndex="2"
  explanation="TCP menomori paket, meng-ACK, dan mengirim ulang yang hilang. Jaminan kelengkapan dibangun di lapisan Transport, bukan di lapisan Internet (IP)."
/>

<QuizBox 
  question="Apa fungsi dari field TTL (Time To Live) pada header IP?"
  :options="['Menentukan waktu kedaluwarsa data', 'Mencegah paket berputar abadi di jaringan saat ada loop routing', 'Menghitung waktu ping (latency)', 'Mengatur kecepatan transmisi (QoS)']"
  :correctIndex="1"
  explanation="TTL akan berkurang 1 setiap kali paket melewati router. Jika nilainya mencapai 0, router akan membuang paket tersebut agar tidak berputar selamanya di jaringan."
/>

<QuizBox 
  question="VoIP (telepon internet) menggunakan UDP, sedangkan unduhan menggunakan TCP. Mengapa tidak dibalik?"
  :options="['Karena UDP lebih aman untuk suara', 'Karena suara yang telat lebih baik dibuang (UDP), sedangkan file yang hilang wajib dikirim ulang (TCP)', 'Karena TCP tidak bisa membawa suara', 'Keduanya bisa ditukar tanpa masalah']"
  :correctIndex="1"
  explanation="Aplikasi real-time seperti VoIP mementingkan kecepatan/kesegaran data; jika ada data hilang lebih baik dibiarkan daripada menunggu retransmisi yang membuat suara jeda. Sebaliknya, unduhan file wajib 100% lengkap."
/>

<QuizBox 
  question="Di link satelit GEO (RTT 500 ms), kenapa koneksi TCP baru terasa 'lambat panas'?"
  :options="['Karena sinyal satelit lemah di awal', 'Karena proses enkripsi butuh waktu lama', 'Karena congestion control TCP menaikkan kecepatan per RTT, sehingga butuh waktu lebih lama mencapai kecepatan penuh', 'Karena router butuh waktu pemanasan']"
  :correctIndex="2"
  explanation="Mekanisme Congestion Control pada TCP (seperti Slow Start) menaikkan jendela transmisi (window) setiap kali menerima ACK (satu RTT). Jika RTT-nya lama (500ms), maka akselerasinya pun ikut lambat."
/>

## Lanjut ke mana?

Lapisan Internet punya dua pertanyaan besar: bagaimana alamat disusun
([Subnetting](/networking/subnetting)) dan bagaimana jalur dipilih
([Routing](/networking/routing)). Mulai dari alamat dulu.
