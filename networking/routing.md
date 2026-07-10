---
title: Routing
---

# Routing

Routing adalah proses memilih jalur untuk paket dari satu jaringan ke jaringan
lain. Setiap router memegang **tabel routing** — daftar "untuk tujuan X,
kirim lewat pintu Y" — dan setiap paket diputuskan **hop demi hop**: router
hanya menentukan langkah berikutnya, bukan seluruh perjalanan.

## Cara router mengambil keputusan

Saat paket tiba, router:

1. Membaca **IP tujuan** di header paket.
2. Mencari entri tabel routing yang cocok.
3. Jika ada beberapa yang cocok, memilih yang **paling spesifik**
   (*longest prefix match*).
4. Meneruskan paket ke *next hop* lewat antarmuka yang tercatat, dengan
   frame layer-2 baru dan TTL dikurangi 1.

### Longest prefix match

Tabel berisi tiga entri berikut, dan paket menuju `10.1.5.20` tiba:

```text
10.0.0.0/8      via 192.0.2.1     ← cocok (8 bit)
10.1.0.0/16     via 192.0.2.5     ← cocok (16 bit)
10.1.5.0/24     via 192.0.2.9     ← cocok (24 bit)  ✔ dipilih
0.0.0.0/0       via 192.0.2.13    ← default route
```

Entri `/24` menang karena paling spesifik. Entri `0.0.0.0/0` — **default
route** — adalah jaring pengaman: "kalau tidak ada yang cocok, lempar ke sini".
Router rumahmu praktis hanya punya satu default route ke ISP.

## Dari mana isi tabel routing berasal?

| Sumber | Ciri | Kapan dipakai |
| --- | --- | --- |
| **Connected** | Otomatis dari antarmuka yang aktif | Selalu |
| **Static** | Diketik admin satu per satu | Jaringan kecil, link stub, default route |
| **Dynamic** | Dipelajari lewat protokol routing | Jaringan menengah–besar |

### Routing statis

```bash
# Linux: semua trafik ke 172.16.0.0/16 lewat 192.0.2.1
ip route add 172.16.0.0/16 via 192.0.2.1

# Cisco IOS
ip route 172.16.0.0 255.255.0.0 192.0.2.1
```

Sederhana dan bisa diprediksi, tapi tidak beradaptasi: kalau link putus, rute
statis tetap menunjuk ke jurang. Untuk itu ada routing dinamis.

## Protokol routing dinamis

Router saling bertukar informasi dan menghitung ulang jalur secara otomatis
saat topologi berubah (*convergence*).

| Protokol | Tipe | Metric | Lingkup | Catatan |
| --- | --- | --- | --- | --- |
| RIP | Distance vector | Hop count (maks 15) | IGP | Legacy; nyaris tak dipakai lagi |
| OSPF | Link state | Cost (∝ bandwidth) | IGP | Standar terbuka, umum di enterprise |
| EIGRP | Advanced distance vector | Bandwidth+delay | IGP | Milik Cisco (kini terbuka) |
| IS-IS | Link state | Cost | IGP | Favorit ISP besar |
| **BGP** | Path vector | Kebijakan & AS-path | **EGP** | Perekat antar-ISP — protokol internet |

### Distance vector vs link state

- **Distance vector** ("routing dari kabar tetangga"): tiap router hanya tahu
  jarak dan arah menurut cerita tetangganya. Sederhana, tapi lambat konvergen
  dan rawan *routing loop*.
- **Link state** ("routing dari peta"): tiap router menyebarkan kondisi
  link-nya ke semua router se-area, sehingga semuanya memegang peta topologi
  lengkap, lalu masing-masing menghitung jalur terpendek dengan algoritme
  **Dijkstra (SPF)**. Konvergensi cepat dan bebas loop.

### OSPF dalam satu paragraf

Router OSPF berkenalan lewat paket *hello*, menjadi *neighbor*, lalu
menyinkronkan basis data topologi (LSDB). Jaringan besar dipecah menjadi
*area* dengan Area 0 sebagai tulang punggung. Cost default berbanding terbalik
dengan bandwidth, sehingga OSPF otomatis memilih jalur tercepat — dan link
ber-cost tinggi (misalnya link satelit cadangan) hanya dipakai saat jalur utama
mati.

### BGP: routing antar-"negara"

Internet adalah federasi ±75.000 **Autonomous System** (AS) — ISP, penyedia
cloud, kampus besar; masing-masing punya nomor AS. BGP mempertukarkan rute
**antar-AS**, dan memilih jalur berdasarkan **kebijakan** (urusan bisnis:
siapa pelanggan, siapa peer), bukan sekadar jarak terpendek. Rute internet
penuh saat ini ±1 juta prefix IPv4.

::: warning Kesalahan BGP berdampak global
Karena BGP saling percaya, satu AS yang salah mengumumkan prefix orang lain
(*route leak / hijack*) bisa membelokkan trafik dunia — beberapa insiden besar
internet bermula dari sini. Mitigasinya (RPKI, filtering) disinggung di
[Keamanan Jaringan](/networking/keamanan#keamanan-infrastruktur-routing).
:::

## Melihat routing bekerja

```bash
# tabel routing lokal
ip route show
# ↳ default via 192.168.1.1 dev wlan0
#   192.168.1.0/24 dev wlan0 scope link src 192.168.1.7

# jejak jalur hop demi hop ke tujuan
traceroute netsat.aderamdani.web.id
# ↳  1  192.168.1.1      2 ms   ← router rumah
#    2  10.20.0.1        9 ms   ← agregasi ISP
#    3  203.0.113.41    14 ms   ← core ISP
#    ...                        ← seterusnya sampai server
```

`traceroute` memanfaatkan TTL: paket pertama diberi TTL 1 (mati di router
pertama, yang lalu mengirim pesan ICMP), paket kedua TTL 2, dan seterusnya —
setiap "kematian" mengungkap satu hop.

## Routing dan satelit

Dua titik temu yang menarik:

- **Link GEO sebagai satu hop mahal.** Bagi routing, link
  [VSAT](/satelit/vsat) hanyalah satu hop — tapi dengan delay ±250 ms sekali
  jalan. Protokol routing perlu disetel (timer hello OSPF, misalnya) agar
  tidak salah mengira link mati, dan link satelit biasanya diberi cost tinggi
  agar hanya menjadi cadangan.
- **Routing di orbit.** Konstelasi LEO dengan *inter-satellite link* seperti
  Starlink benar-benar melakukan forwarding di angkasa — topologinya berubah
  terus karena [satelit bergerak](/satelit/orbit#leo-low-earth-orbit) ±7,5 km/s,
  masalah routing yang tidak pernah dihadapi jaringan darat.

## Uji pemahaman

1. Paket menuju `172.16.5.9`; tabel memuat `172.16.0.0/16 via A` dan
   `172.16.5.0/24 via B`. Lewat mana? → **B** (longest prefix match).
2. Kenapa link satelit diberi OSPF cost tinggi? → Agar dipilih hanya ketika
   jalur teresterial mati (cadangan).
3. Protokol apa yang merutekan **antar**-ISP? → **BGP**.

**Praktik:** rute statis, failover dua WAN, OSPF, dan BGP dikonfigurasi nyata
di [Routing di RouterOS (MikroTik)](/mikrotik/routing).

Routing mengurus perpindahan **antar**-jaringan. Perpindahan **di dalam** satu
jaringan lokal adalah dunia yang berbeda: [Switching & VLAN](/networking/switching).
