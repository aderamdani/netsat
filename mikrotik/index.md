---
title: Pengantar RouterOS
---

# Pengantar RouterOS

Dua modul pertama membangun teorinya; modul ini tempat mengotorinya dengan
praktik. **RouterOS** adalah sistem operasi jaringan buatan MikroTik — dan
karena harganya terjangkau serta fiturnya selengkap perangkat kelas enterprise,
ia menjadi "bahasa ibu" ribuan network engineer Indonesia: dari RT/RW-net,
warung internet, ISP daerah, sampai router di belakang terminal
[VSAT](/satelit/vsat) pelosok.

Setiap halaman modul ini mengambil satu tema, menautkannya ke teori yang sudah
dibahas, lalu menunjukkan konfigurasi nyatanya baris demi baris.

## RouterOS dan RouterBOARD

Dua nama yang sering tertukar:

| Istilah | Apa itu |
| --- | --- |
| **RouterOS** | Sistem operasinya — berbasis kernel Linux, berisi routing, firewall, VPN, wireless, QoS |
| **RouterBOARD** | Perangkat kerasnya — papan/kotak fisik buatan MikroTik (hEX, hAP, CCR, CRS…) yang dijual dengan RouterOS terpasang |
| **CHR** | *Cloud Hosted Router* — RouterOS sebagai mesin virtual (Proxmox, VMware, AWS) untuk lab dan cloud |

Posisinya sebagai *network OS*: satu kotak RouterOS bisa sekaligus menjadi
[router](/networking/routing), [switch](/networking/switching),
[firewall](/networking/keamanan#firewall), access point, server
[DHCP/DNS](/networking/protokol), dan gerbang [VPN](/mikrotik/vpn) — fungsi
yang di vendor lain sering dipecah ke beberapa perangkat.

::: tip Lab tanpa membeli apa pun
CHR gratis dijalankan di VirtualBox/Proxmox (kecepatan dibatasi 1 Mbps tanpa
lisensi — cukup untuk belajar). Seluruh perintah di modul ini bisa dicoba di
lab virtual sebelum menyentuh perangkat produksi.
:::

### Menyiapkan lab CHR dalam lima langkah

1. Unduh *image* CHR (format `.vdi`/`.vmdk`/`.img`) dari halaman unduhan
   mikrotik.com.
2. Buat VM baru di VirtualBox/Proxmox; pakai image tadi sebagai disk (tidak
   ada proses instal — RouterOS langsung boot).
3. Beri VM **dua adapter jaringan**: satu NAT (jadi "WAN"), satu host-only
   atau internal (jadi "LAN" tempat laptopmu berperan sebagai klien).
4. Nyalakan; login `admin` tanpa password di konsol VM.
5. Ulangi untuk router kedua bila bab [Routing](/mikrotik/routing) atau
   [VPN](/mikrotik/vpn) butuh dua kotak yang saling bicara.

Ingin lebih nyaman lagi, jalankan beberapa CHR dalam satu topologi visual
dengan **GNS3** atau **EVE-NG** — dua alat standar untuk lab jaringan.

## Arsitektur menu: konfigurasi sebagai pohon

Seluruh konfigurasi RouterOS tersusun sebagai **pohon menu** — di CLI, WinBox,
maupun WebFig, strukturnya sama persis:

```text
/
├── interface/        ← semua antarmuka: ethernet, bridge, vlan, wifi, wireguard
│   ├── bridge/
│   ├── vlan/
│   └── wireguard/
├── ip/               ← dunia IPv4: address, route, dhcp, dns, firewall
│   ├── address/
│   ├── dhcp-server/
│   ├── dns/
│   ├── firewall/
│   └── route/
├── routing/          ← protokol routing dinamis: ospf, bgp, filter
├── system/           ← identitas, jam, backup, upgrade, reset
├── user/             ← akun & grup akses
└── tool/             ← ping, traceroute, sniffer, mac-server
```

Peta mentalnya gampang: **teori [lapisan](/networking/model-osi) ≈ letak
menu**. Urusan layer 2 tinggal di `/interface` (bridge, VLAN), urusan layer 3
di `/ip` dan `/routing`, kebijakan keamanan di `/ip/firewall`.

Sejak RouterOS v7, path perintah bisa ditulis dengan `/` sebagai pemisah
(`/ip/address/print`) — gaya yang dipakai seluruh modul ini karena sama persis
dengan dokumentasi resmi. Gaya lama berpemisah spasi (`/ip address print`)
tetap berfungsi.

## Lisensi level

RouterOS berlisensi per perangkat, sekali bayar, seumur hidup perangkat.
Level menentukan kapasitas fitur — bukan kecepatannya:

| Level | Nama | Khas dipakai untuk | Catatan |
| --- | --- | --- | --- |
| L1 | Demo | Uji coba | Gratis, fitur terbatas |
| L3 | CPE | Perangkat sisi pelanggan | Hanya dijual dalam volume; wireless hanya mode *station* |
| L4 | WISP CPE | AP kecil, router kantor | Bawaan kebanyakan RouterBOARD kecil (hAP, hEX) |
| L5 | WISP | AP besar, ISP kecil | Lebih banyak tunnel & user hotspot |
| L6 | Controller | ISP, data center | Tanpa batasan |

CHR memakai skema berbeda (*p1/p10/p-unlimited* — dibatasi kecepatan, bukan
fitur). Untuk seluruh modul ini, fitur yang dibahas tersedia di L4 ke atas —
level yang paling umum beredar.

## Konvensi modul ini

Supaya semua contoh konsisten dan aman ditiru:

- Alamat memakai blok dokumentasi [RFC 5737](/tentang#konvensi-penulisan):
  **`192.0.2.0/24` = LAN**, **`203.0.113.0/24` = WAN/publik**,
  `198.51.100.0/24` = situs lawan/cabang.
- `ether1` selalu port WAN (ke internet/modem), `ether2` dst. ke arah LAN —
  meniru konvensi *default configuration* MikroTik.
- Setiap blok perintah diikuti penjelasan per baris/parameter — jangan tempel
  konfigurasi yang belum kamu pahami ke perangkat produksi.

Contoh formatnya:

```bash
/ip/address/add address=192.0.2.1/24 interface=ether2 comment="LAN utama"
```

- `/ip/address/add` — masuk menu alamat IP, tambah entri baru.
- `address=192.0.2.1/24` — IP router **plus prefix**; dari sinilah RouterOS
  otomatis menghitung network `192.0.2.0` dan broadcast `192.0.2.255`
  (persis teori [subnetting](/networking/subnetting#notasi-cidr-dan-subnet-mask)).
- `interface=ether2` — alamat menempel ke port, bukan ke kotak.
- `comment=` — kebiasaan baik: label untuk dirimu enam bulan lagi.

## Peta modul ini

| # | Halaman | Menautkan ke teori |
| --- | --- | --- |
| 1 | [Akses Awal](/mikrotik/akses-awal) | [Switching](/networking/switching) (MAC-telnet = layer 2) |
| 2 | [Manajemen Perangkat](/mikrotik/manajemen) | — (bekal alat kerja) |
| 3 | [Interface & IP Address](/mikrotik/interface-ip) | [Subnetting](/networking/subnetting) |
| 4 | [IPv6 di RouterOS](/mikrotik/ipv6) | [Subnetting](/networking/subnetting#deep-dive-ipv6-subnetting) (IPv6) |
| 5 | [Bridging & Switching](/mikrotik/bridging-switching) | [Switching & VLAN](/networking/switching) |
| 6 | [DHCP, DNS & NAT](/mikrotik/dhcp-dns-nat) | [Protokol Jaringan](/networking/protokol) |
| 7 | [Routing di RouterOS](/mikrotik/routing) | [Routing](/networking/routing) |
| 8 | [Firewall & QoS](/mikrotik/firewall-qos) | [Keamanan Jaringan](/networking/keamanan) |
| 9 | [PPPoE](/mikrotik/pppoe) | [Protokol Jaringan](/networking/protokol) (PPP) |
| 10 | [VPN](/mikrotik/vpn) | [Keamanan](/networking/keamanan#vpn-terowongan-terenkripsi) |
| 11 | [Wireless & Satelit](/mikrotik/wireless-dan-satelit) | [VSAT](/satelit/vsat), [Komunikasi Satelit](/satelit/komunikasi) |
| 12 | [Failover & Multi-WAN Satelit](/mikrotik/multi-wan) | [Routing](/networking/routing#dari-mana-isi-tabel-routing-berasal) |
| 13 | [Optimasi VPN & MTU/MSS](/mikrotik/vpn-optimization) | [VPN di atas satelit](/mikrotik/vpn#vpn-di-atas-link-satelit) |
| 14 | [QoS Dinamis](/mikrotik/dynamic-qos) | [Firewall & QoS](/mikrotik/firewall-qos) |
| 15 | [Operasi & Monitoring](/mikrotik/monitoring) | [Manajemen Perangkat](/mikrotik/manajemen) (bekal) |
| 16 | [Scripting & Otomatisasi](/mikrotik/scripting-otomatisasi) | [Manajemen Perangkat](/mikrotik/manajemen#tata-bahasa-cli) |
| 17 | [Glosari](/mikrotik/glosari) | — (referensi cepat) |

Referensi utama modul ini adalah dokumentasi resmi
[manual.mikrotik.com](https://manual.mikrotik.com) — struktur topiknya sengaja
kami ikuti agar mudah memperdalam ke sumber aslinya.

## Cara belajar yang kami sarankan

1. **Baca teorinya dulu** (kolom kanan tabel di atas) — sepuluh menit teori
   menghemat satu jam kebingungan di terminal.
2. **Ketik, jangan tempel.** Mengetik perintah memaksa kamu membaca tiap
   parameter; di situlah pemahaman menempel.
3. **Rusak lalu perbaiki.** Setelah konfigurasi jalan, sengaja matikan satu
   bagian (`disable`), amati gejalanya, hidupkan lagi. Gejala yang pernah
   kamu buat sendiri adalah gejala yang akan langsung kamu kenali di
   produksi.
4. **`/export` setiap selesai bab** — bandingkan hasil ekspormu dengan contoh
   di halaman; perbedaan kecil sering mengungkap pemahaman yang meleset.

Mulai dari yang paling awal: kotak baru datang, [bagaimana masuk ke
dalamnya?](/mikrotik/akses-awal)
