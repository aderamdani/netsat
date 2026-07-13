---
title: Firewall & QoS
---

# Firewall & QoS

Prinsipnya sudah ditegakkan di [Keamanan Jaringan](/networking/keamanan#firewall)
dan [Firewall — Panduan Lengkap](/networking/firewall):
**default deny**, stateful, pertahanan berlapis. Halaman ini membangunnya di
`/ip/firewall` — lalu mengatur *seberapa cepat* yang lolos boleh berlari
dengan QoS.

## Tiga chain: posisi menentukan nasib

Firewall filter RouterOS memilah paket berdasarkan arah relatifnya terhadap
router:

| Chain | Arah paket | Contoh trafik |
| --- | --- | --- |
| **input** | Menuju **ke router ini** | SSH/WinBox ke router, ping ke router |
| **forward** | **Numpang lewat** router | LAN ↔ internet — mayoritas trafik |
| **output** | Berasal **dari router** | Router bertanya DNS, sinkronisasi NTP |

Aturan dibaca **berurutan dari atas**; eksekusi berhenti di aturan pertama
yang cocok. Urutan = segalanya.

## Connection tracking: ingatan firewall

RouterOS adalah [firewall stateful](/networking/keamanan#firewall): tabel
*connection tracking* mengingat setiap koneksi beserta statusnya —
`new` (paket pembuka, [SYN](/networking/model-tcp-ip#tcp-andal-berurutan-kenal-kemacetan)-nya
TCP), `established` (koneksi sah yang sedang berjalan), `related` (koneksi
turunan), `invalid` (tak jelas asal-usulnya, dibuang tanpa ampun).

Konsekuensi praktisnya: cukup nilai paket **pembuka** dengan ketat, lalu
loloskan sisanya secara massal — cepat dan aman.

## Firewall dasar yang layak produksi

Urutan aturan untuk chain `input` (melindungi router itu sendiri):

```bash
/ip/firewall/filter/add chain=input action=accept connection-state=established,related \
  comment="1: loloskan koneksi yang sudah sah"
/ip/firewall/filter/add chain=input action=drop connection-state=invalid \
  comment="2: buang yang tak jelas"
/ip/firewall/filter/add chain=input action=accept protocol=icmp \
  comment="3: izinkan ping/traceroute"
/ip/firewall/filter/add chain=input action=accept src-address=192.0.2.0/24 \
  comment="4: manajemen hanya dari LAN"
/ip/firewall/filter/add chain=input action=drop comment="5: default deny"
```

- Aturan 1 diletakkan **paling atas** karena menangkap >95% paket — sekali
  lolos jadi `established`, paket berikutnya tak perlu dinilai ulang.
- Aturan 5 tanpa kriteria apa pun = cocok dengan segalanya =
  [default deny](/networking/keamanan#firewall) yang sesungguhnya. Semua yang
  tidak diizinkan eksplisit, mati di sini — termasuk WinBox dari internet.

Untuk chain `forward` (melindungi LAN):

```bash
/ip/firewall/filter/add chain=forward action=accept connection-state=established,related
/ip/firewall/filter/add chain=forward action=drop connection-state=invalid
/ip/firewall/filter/add chain=forward action=accept in-interface=bridge1 out-interface=ether1 \
  comment="LAN boleh ke internet"
/ip/firewall/filter/add chain=forward action=accept connection-nat-state=dstnat \
  in-interface=ether1 comment="izinkan yang memang di-port-forward"
/ip/firewall/filter/add chain=forward action=drop comment="default deny"
```

- `connection-nat-state=dstnat` — hanya koneksi masuk yang sudah kamu buka
  lewat [dst-nat](/mikrotik/dhcp-dns-nat#dst-nat-membuka-layanan-ke-dalam-port-forward)
  yang boleh menembus; sisanya jatuh ke default deny.

::: warning Uji dari luar, bukan dari dalam
Sesudah memasang firewall, uji dari sisi WAN (bisa `/tool/fetch` dari router
lain, atau ponsel via seluler). Dan sekali lagi: kerjakan dalam
[Safe Mode](/mikrotik/manajemen#tata-bahasa-cli) — aturan drop yang salah
tempat memutus sesimu sendiri.
:::

## Address-list: firewall yang menulis dirinya sendiri

Kumpulan alamat bernama, bisa diisi manual maupun **otomatis** — bahan baku
aturan dinamis:

```bash
/ip/firewall/address-list/add list=manajemen address=192.0.2.0/24
/ip/firewall/filter/add chain=input protocol=tcp dst-port=22 src-address-list=!manajemen \
  action=add-src-to-address-list address-list=penyusup address-list-timeout=1d
/ip/firewall/filter/add chain=input src-address-list=penyusup action=drop \
  place-before=0 comment="blokir penyusup lebih dulu"
```

- Baris 2: siapa pun **di luar** daftar `manajemen` (`!` = negasi) yang
  mengetuk SSH otomatis dicatat ke daftar `penyusup` selama satu hari.
- Baris 3 (`place-before=0` = sisipkan paling atas): seisi daftar `penyusup`
  ditolak. Hasilnya *blocklist* yang mengisi dirinya sendiri — pola dasar
  proteksi brute-force ala manual resmi.

## Mangle dan FastTrack

**Mangle** menandai paket/koneksi tanpa menghakimi — tandanya dipakai
komponen lain (queue, routing policy):

```bash
/ip/firewall/mangle/add chain=forward protocol=udp dst-port=5060,10000-20000 \
  action=mark-connection new-connection-mark=koneksi-voip passthrough=yes
/ip/firewall/mangle/add chain=forward connection-mark=koneksi-voip \
  action=mark-packet new-packet-mark=voip passthrough=no
```

- Pola dua langkah (tandai koneksi → tandai paketnya) hemat CPU: pencocokan
  port yang mahal hanya terjadi sekali per koneksi.

**FastTrack** melompati sebagian besar pemrosesan untuk koneksi yang sudah
dipercaya — throughput naik drastis di perangkat kecil:

```bash
/ip/firewall/filter/add chain=forward action=fasttrack-connection \
  connection-state=established,related hw-offload=yes comment="jalur cepat"
/ip/firewall/filter/add chain=forward action=accept connection-state=established,related
```

- Konsekuensinya jujur: paket yang di-fasttrack **melewati mangle dan queue**.
  Kalau kamu butuh QoS menyeluruh (kasus nyata:
  [link satelit](/mikrotik/wireless-dan-satelit#routeros-di-jaringan-vsat)),
  jangan fasttrack trafik yang mau diatur.

## QoS: membagi pipa yang terbatas

### Simple queue

Cara tercepat membatasi bandwidth per pelanggan/subnet:

```bash
/queue/simple/add name=lab target=192.0.2.128/26 max-limit=10M/20M
```

- `target=` — siapa yang diatur; `max-limit=upload/download` **dari sudut
  pandang target** (10 Mbps naik, 20 Mbps turun).
- Simple queue dievaluasi berurutan dan menangkap trafik dua arah — cukup
  untuk 90% kebutuhan.

### Queue tree + PCQ (sekilas)

Untuk kebijakan hierarkis — "VoIP selalu menang, sisanya berbagi rata":

```bash
/queue/type/add name=bagi-rata kind=pcq pcq-classifier=dst-address
/queue/tree/add name=total parent=global max-limit=50M
/queue/tree/add name=voip parent=total packet-mark=voip priority=1 limit-at=5M max-limit=10M
/queue/tree/add name=data parent=total packet-mark=no-mark queue=bagi-rata max-limit=50M
```

- `parent=global` → anak-anaknya berbagi satu pipa 50M; `priority=1` (tertinggi
  dari 8) membuat paket bertanda `voip` — hasil mangle di atas — selalu
  didahulukan; `limit-at=5M` adalah jaminannya (CIR-nya
  [dunia VSAT](/satelit/vsat#merancang-layanan-parameter-yang-diperjualbelikan)).
- `pcq` membagi kapasitas secara adil per alamat — satu pengunduh rakus tak
  bisa memonopoli.

## Interface lists: aturan yang tak perlu diubah saat topologi berubah

- Problem: firewall rules referencing specific interfaces break when you rename/restructure ports
- Solution: `/interface/list/add name=WAN` and `/interface/list/member/add list=WAN interface=ether1`
- Use in firewall: `in-interface-list=WAN` instead of `in-interface=ether1`
- Add other WANs later by just adding members
- Predefined lists: `WAN`, `LAN` (from default config)
- Interface lists work everywhere: firewall, NAT, queue, routes

```bash
/interface/list/add name=WAN
/interface/list/member/add list=WAN interface=ether1
/interface/list/member/add list=WAN interface=sfp1

/ip/firewall/filter/add chain=input in-interface-list=WAN protocol=tcp dst-port=22 action=drop
```

## DSCP: menandai paket untuk QoS upstream

DSCP *marking* di mangle memberi sinyal prioritas ke router hilir — seberapa
penting sebuah paket di mata jaringan selanjutnya:

```bash
/ip/firewall/mangle/add chain=forward protocol=udp dst-port=5060 action=set-dscp new-dscp=ef
/ip/firewall/mangle/add chain=forward protocol=tcp dst-port=443 action=set-dscp new-dscp=af21
```

| Nilai    | Kegunaan             | Singkatan                              |
|----------|----------------------|----------------------------------------|
| `ef`     | VoIP                 | Expedited Forwarding                   |
| `af41`   | Video streaming      | Assured Forwarding kelas 4 prioritas 1 |
| `af21`   | Data kritis / RDP    | Assured Forwarding kelas 2 prioritas 1 |
| `default`| Best effort          | Default (tanda DSCP 0)                 |

- Efeknya bergantung pada **kebijakan operator** (ISP bisa menghormati atau
  mengabaikan — banyak ISP Indonesia justru menimpa ulang).
- Di jaringan sendiri, kombinasikan dengan queue tree untuk prioritas
  *end-to-end*: mangle memberi tanda, queue tree membaca `packet-mark` lalu
  mengatur antrean berdasarkan tanda itu.

## Burst: kecepatan ekstra di awal

Simple queue bisa memberi **semburan** kecepatan di detik-detik pertama,
selama pemakaian rata-rata masih di bawah ambang — efeknya *browsing* terasa
ringan meskipun bandwidth kecil:

```bash
/queue/simple/add name=tetangga target=192.0.2.50/32 \
  max-limit=5M/10M \
  burst-limit=15M/20M \
  burst-threshold=3M/5M \
  burst-time=1m/1m
```

Cara kerja algoritma burst: saat trafik turun di bawah `burst-threshold`,
*pendingin* berjalan — `burst-time` (1 menit) adalah durasi maksimal
kecepatan penuh boleh bertahan. Begitu rata-rata menyentuh threshold lagi,
kecepatan dipotong ke `max-limit` sampai pendinginan berikutnya.

Cocok untuk koneksi *residential* (browsing, scroll media sosial), **tidak
cocok** untuk VoIP atau streaming real-time yang butuh bandwidth stabil.

## Aturan berbasis waktu

Filter dan mangle bisa dibatasi jadwal — matikan akses game/workstation di
jam kerja, batasi internet anak-anak di malam hari:

```bash
/ip/firewall/filter/add chain=forward protocol=udp dst-port=3478,3479 \
  time=07:00-17:00,sun,mon,tue,wed,thu,fri action=drop \
  comment="blokir Discord voice di jam kerja"
/ip/firewall/filter/add chain=forward src-address-list=anak \
  time=21:00-06:00,sun,mon,tue,wed,thu,fri,sat action=drop \
  comment="internet anak mati pukul 21.00"
```

- `time=start_time-stop_time,daftar_hari` — format hari sama seperti di
  cron, tiga huruf bahasa Inggris.
- Kombinasikan dengan address-list untuk kontrol **siapa** dan **kapan**:
  daftar `anak` diisi manual, aturan waktu di atas membatasi jadwal.

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Kenapa `established,related` selalu aturan pertama? → Efisiensi: mayoritas
   paket langsung lolos tanpa mengevaluasi sisa daftar — firewall stateful
   [bekerja sekali di paket pembuka](/networking/keamanan#firewall).
2. QoS-mu tidak berefek sama sekali padahal queue sudah benar — tersangka
   utamanya? → **FastTrack**: koneksi melompati queue. Matikan/kecualikan.
3. Port forward jalan, tapi kamu ingin hanya kantor cabang
   (`198.51.100.0/24`) yang boleh mengaksesnya — di mana menyaringnya? →
   chain `forward` dengan `connection-nat-state=dstnat` +
   `src-address=198.51.100.0/24`.

Lalu lintas sudah tersaring dan terjadwal. Berikutnya menyambungkan
pulau-pulau jaringan dengan terowongan terenkripsi: [VPN](/mikrotik/vpn).

</details>