---
title: Firewall & QoS
---

# Firewall & QoS

Prinsipnya sudah ditegakkan di [Keamanan Jaringan](/networking/keamanan#firewall):
**default deny**, stateful, pertahanan berlapis. Halaman ini membangunnya di
`/ip/firewall` — lalu mengatur *seberapa cepat* yang lolos boleh berlari
dengan QoS.

## Tiga chain: posisi menentukan nasib

Firewall filter RouterOS memilah paket berdasarkan arah relatifnya terhadap
router:

```
            ┌────────────────────────────┐
 masuk ───▶ │  input    → ke router ini  │  (SSH/WinBox ke router, ping router)
            │  forward  → numpang lewat  │  (LAN ↔ internet — mayoritas trafik)
            │  output   → dari router    │  (router bertanya DNS, NTP)
            └────────────────────────────┘
```

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

```
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

```
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

```
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

```
/ip/firewall/mangle/add chain=forward protocol=udp dst-port=5060,10000-20000 \
  action=mark-connection new-connection-mark=koneksi-voip passthrough=yes
/ip/firewall/mangle/add chain=forward connection-mark=koneksi-voip \
  action=mark-packet new-packet-mark=voip passthrough=no
```

- Pola dua langkah (tandai koneksi → tandai paketnya) hemat CPU: pencocokan
  port yang mahal hanya terjadi sekali per koneksi.

**FastTrack** melompati sebagian besar pemrosesan untuk koneksi yang sudah
dipercaya — throughput naik drastis di perangkat kecil:

```
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

```
/queue/simple/add name=lab target=192.0.2.128/26 max-limit=10M/20M
```

- `target=` — siapa yang diatur; `max-limit=upload/download` **dari sudut
  pandang target** (10 Mbps naik, 20 Mbps turun).
- Simple queue dievaluasi berurutan dan menangkap trafik dua arah — cukup
  untuk 90% kebutuhan.

### Queue tree + PCQ (sekilas)

Untuk kebijakan hierarkis — "VoIP selalu menang, sisanya berbagi rata":

```
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

## Uji pemahaman

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
