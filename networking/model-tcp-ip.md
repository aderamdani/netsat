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

```
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

Field yang paling sering kamu temui dalam praktik:

- **TTL** (*Time To Live*) — berkurang 1 di tiap router; saat mencapai 0 paket
  dibuang. Mencegah paket berputar selamanya. `traceroute` bekerja dengan
  sengaja mengirim paket ber-TTL kecil.
- **Protocol** — isi paket ini apa: 6 = TCP, 17 = UDP, 1 = ICMP.
- **DSCP** — penanda prioritas untuk QoS; penting di link satelit yang
  bandwidth-nya mahal.

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

### TCP: andal, berurutan, kenal kemacetan

TCP membuka koneksi lewat **three-way handshake**:

```
Klien                         Server
  │ ── SYN  (seq=x) ────────────▶ │
  │ ◀─ SYN-ACK (seq=y, ack=x+1) ─ │
  │ ── ACK  (ack=y+1) ──────────▶ │
  │        koneksi terbentuk      │
```

Setelah itu setiap byte diberi nomor urut, penerima mengirim ACK, dan data yang
hilang dikirim ulang. Dua mekanisme kendali membuat TCP "sopan":

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

## Lanjut ke mana?

Lapisan Internet punya dua pertanyaan besar: bagaimana alamat disusun
([Subnetting](/networking/subnetting)) dan bagaimana jalur dipilih
([Routing](/networking/routing)). Mulai dari alamat dulu.
