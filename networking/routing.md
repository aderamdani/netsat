---
title: Routing
---

# Routing

Routing adalah proses memilih jalur untuk paket dari satu jaringan ke jaringan
lain. Setiap router memegang **tabel routing** — daftar "untuk tujuan X,
kirim lewat pintu Y" — dan setiap paket diputuskan **hop demi hop**: router
hanya menentukan langkah berikutnya, bukan seluruh perjalanan.

::: info Analogi: papan petunjuk di persimpangan
Tidak ada satu pun papan petunjuk jalan yang memuat rute lengkap ke tujuanmu —
tiap persimpangan hanya menunjuk arah *berikutnya*: "Bandung → kiri". Kamu
sampai karena **setiap** persimpangan menunjuk arah yang konsisten. Router
bekerja persis begitu; dan seperti papan jalan, kalau ada satu persimpangan
yang salah tunjuk, paket bisa nyasar atau berputar-putar.
:::

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

| Subnet / Prefix | Next Hop (via) | Status Pencocokan | Kesimpulan |
| :--- | :--- | :--- | :--- |
| `10.0.0.0/8` | `192.0.2.1` | Cocok *(8 bit)* | |
| `10.1.0.0/16` | `192.0.2.5` | Cocok *(16 bit)* | |
| **`10.1.5.0/24`** | **`192.0.2.9`** | **Cocok *(24 bit)*** | **✔ Dipilih (paling spesifik)** |
| `0.0.0.0/0` | `192.0.2.13` | - | *Default route* |

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

### Kalau dua sumber mengklaim rute yang sama?

Longest prefix match membandingkan rute ke tujuan **berbeda spesifisitasnya**.
Tapi bila dua *sumber* (mis. rute statis dan OSPF) menawarkan prefix yang
**persis sama**, router memilih berdasarkan tingkat kepercayaan pada sumbernya
— disebut **administrative distance** (istilah Cisco; MikroTik & lainnya
menyebutnya *distance*). Makin kecil makin dipercaya:

| Sumber | Distance (umum) |
| --- | --- |
| Connected | 0 |
| Static | 1 |
| OSPF | 110 |
| RIP | 120 |

Urutan lengkap pengambilan keputusan: **(1)** longest prefix match dulu;
**(2)** jika prefix sama, distance terkecil; **(3)** jika masih seri di dalam
satu protokol, metric terkecil. Trik `distance` ini pula yang dipakai untuk
**failover**: rute cadangan dipasang dengan distance lebih besar, dan baru
"muncul" saat rute utama hilang.

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

## Cek pemahaman

1. Paket menuju `172.16.5.9`; tabel memuat `172.16.0.0/16 via A` dan
   `172.16.5.0/24 via B`. Lewat mana?
2. Kenapa link satelit diberi OSPF cost tinggi?
3. Protokol apa yang merutekan **antar**-ISP?
4. Rute statis `10.0.0.0/8 distance 1` dan rute OSPF `10.0.0.0/8 distance 110`
   ada bersamaan — mana yang dipakai?
5. `traceroute` berhenti di hop ke-5 dan tidak pernah sampai. Apa dugaan
   pertamamu?

<details>
<summary>Lihat jawaban</summary>

1. **B** (longest prefix match).
2. Agar dipilih hanya ketika jalur teresterial mati (cadangan).
3. **BGP**.
4. **Statis** (prefix sama, distance lebih kecil menang).
5. Router hop-5 tidak punya rute lanjutan (atau memblokir ICMP) — mulai
   periksa tabel routing di sana.

</details>

**Praktik:** rute statis, failover dua WAN, OSPF, dan BGP dikonfigurasi nyata
di [Routing di RouterOS (MikroTik)](/mikrotik/routing).

Routing mengurus perpindahan **antar**-jaringan. Perpindahan **di dalam** satu
jaringan lokal adalah dunia yang berbeda: [Switching & VLAN](/networking/switching).