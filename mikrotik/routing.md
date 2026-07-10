---
title: Routing di RouterOS
---

# Routing di RouterOS

Modul teori sudah menjelaskan [cara router berpikir](/networking/routing):
longest prefix match, rute statis vs dinamis, OSPF, BGP. Halaman ini
menerjemahkannya ke `/ip/route` dan `/routing` — termasuk trik failover yang
paling sering dipakai di lapangan.

## Membaca tabel routing

```text
/ip/route/print
# Flags: D - dynamic, A - active, c - connect, s - static, o - ospf, b - bgp
#  #    DST-ADDRESS        GATEWAY         DISTANCE
#  0 As 0.0.0.0/0          203.0.113.1     1
#  1 DAc 192.0.2.0/24      bridge1         0
#  2 DAc 203.0.113.0/24    ether1          0
```

- `DAc` — *dynamic, active, connected*: lahir otomatis dari setiap
  [alamat yang kamu pasang](/mikrotik/interface-ip#memasang-alamat-ip); inilah
  rute *connected* dari [teori](/networking/routing#dari-mana-isi-tabel-routing-berasal).
- `As` — *active, static*: buatan tangan.
- Pemilihan rute mengikuti persis
  [longest prefix match](/networking/routing#longest-prefix-match); jika prefix
  sama panjang, menang yang **distance**-nya terkecil.

## Rute statis dan default route

```bash
/ip/route/add dst-address=198.51.100.0/24 gateway=192.0.2.254 comment="ke jaringan cabang"
```

- `dst-address=` — tujuan yang dirutekan; `gateway=` — *next hop* yang harus
  [se-subnet dengan salah satu interface](/networking/switching#arp-jembatan-antara-ip-dan-mac).

**Default route** — jaring pengaman "selain itu semua, lempar ke ISP":

```bash
/ip/route/add dst-address=0.0.0.0/0 gateway=203.0.113.1
```

- `0.0.0.0/0` cocok dengan segalanya tapi kalah spesifik dari rute mana pun —
  [persis perannya di teori](/networking/routing#longest-prefix-match). (Jika
  WAN memakai [DHCP client](/mikrotik/dhcp-dns-nat#dhcp-client-sisi-wan),
  rute ini sudah dibuat otomatis.)

## Failover dua WAN: distance + check-gateway

Kantor dengan dua jalur — fiber utama dan [VSAT](/satelit/vsat) cadangan:

```bash
/ip/route/add dst-address=0.0.0.0/0 gateway=203.0.113.1 distance=1 \
  check-gateway=ping comment="utama - fiber"
/ip/route/add dst-address=0.0.0.0/0 gateway=198.51.100.1 distance=2 \
  comment="cadangan - vsat"
```

- `distance=1` vs `distance=2` — dua rute ke tujuan sama; hanya yang
  ber-distance terkecil yang aktif (bendera `A`).
- `check-gateway=ping` — router memeriksa gateway utama tiap 10 detik; dua
  kali gagal → rute dinonaktifkan → rute distance 2 otomatis naik menggantikan.
  Fiber pulih → kembali otomatis. Failover tiga baris, tanpa protokol dinamis.

::: tip Kenapa VSAT selalu jadi distance besar
Persis logika [cost tinggi untuk link satelit](/networking/routing#routing-dan-satelit)
di teori: kapasitas mahal dan [RTT ±500 ms](/satelit/komunikasi#latensi-per-orbit)
membuatnya ideal sebagai cadangan, bukan jalur utama.
:::

## OSPF

Untuk jaringan yang tumbuh melebihi kemampuan rute statis. Skenario minimum:
dua router bertukar rute lewat link antar-kantor `198.51.100.0/30`
([kenapa /30?](/networking/subnetting#vlsm-subnet-dengan-ukuran-berbeda-beda)).

Di Router-A (LAN `192.0.2.0/24`):

```bash
/routing/ospf/instance/add name=default version=2 router-id=192.0.2.1
/routing/ospf/area/add name=backbone area-id=0.0.0.0 instance=default
/routing/ospf/interface-template/add area=backbone networks=198.51.100.0/30 interfaces=ether5
/routing/ospf/interface-template/add area=backbone networks=192.0.2.0/24 interfaces=bridge1 passive
```

- `instance` — proses OSPF-nya; `router-id` identitas unik si router.
- `area ... area-id=0.0.0.0` — [Area 0, tulang punggung](/networking/routing#ospf-dalam-satu-paragraf);
  jaringan kecil cukup satu area ini.
- `interface-template` — di interface mana OSPF berbicara dan prefix apa yang
  diumumkan. `passive` pada LAN = umumkan subnetnya, tapi jangan cari
  [neighbor](/networking/routing#ospf-dalam-satu-paragraf) di sana (tidak ada
  router lain di antara para PC — sekaligus lebih aman).

Router-B dikonfigurasi cermin (router-id dan networks LAN-nya sendiri). Lalu
saksikan:

```bash
/routing/ospf/neighbor/print    # harus ada neighbor ber-state "Full"
/ip/route/print where ospf      # rute belajar-otomatis berbendera "Do"
```

Menyetel **cost** — misalnya agar link satelit hanya dilirik saat fiber mati:

```bash
/routing/ospf/interface-template/set [find interfaces=ether6] cost=1000
```

## BGP

Skenario khas: ISP kecil/enterprise ber-AS sendiri melakukan *peering*. Sesuai
[teori](/networking/routing#bgp-routing-antar-negara), BGP bicara kebijakan
antar-AS — konfigurasinya pun berpasangan eksplisit:

```bash
/routing/bgp/connection/add name=ke-upstream remote.address=203.0.113.1 remote.as=64500 \
  local.role=ebgp output.network=bgp-keluar
/ip/firewall/address-list/add list=bgp-keluar address=198.51.100.0/24
```

- `/routing/bgp/connection` — satu entri = satu sesi peering (menu resmi v7).
- `remote.as=64500` beda dengan AS kita → sesi **eBGP**; `local.role=ebgp`
  menegaskan peran (BGP modern memakai peran untuk mencegah
  [route leak](/networking/routing#bgp-routing-antar-negara)).
- `output.network=` — daftar prefix yang **kita umumkan** ke dunia, diambil
  dari address-list; tanpa ini kamu hanya mendengar tanpa bersuara.

```bash
/routing/bgp/session/print   # sesi established?
```

::: warning Kekuatan besar, tanggung jawab besar
Salah mengumumkan prefix orang lain lewat BGP bukan sekadar bug — itu
[insiden internet](/networking/keamanan#keamanan-infrastruktur-routing).
Selalu pasang filter keluar (`output.filter`) dan validasi
[RPKI](/networking/keamanan#keamanan-infrastruktur-routing) di sesi produksi.
:::

## ECMP: dua jalur, satu tujuan

Tidak semua kantor punya satu gateway. Kadang dua jalur ke ISP yang sama
layaknya kembar identik — bandwidth, biaya, dan prioritasnya setara. Router
bisa memakainya **bersamaan** lewat ECMP (*Equal-Cost Multi-Path*).

```bash
/ip/route/add dst-address=0.0.0.0/0 gateway=203.0.113.1,198.51.100.1 distance=1
```

Perhatikan: dua gateway dipisah koma dalam satu baris, dan **distance-nya
sama**. Inilah kuncinya — karena ECMP hanya aktif jika metric (distance)
bernilai identik. Router lalu membagi *new connection* secara round-robin ke
kedua gateway; satu sesi tetap keluar melalui gateway yang sama (*per
connection, not per packet*), sehingga tidak ada TCP reset akibat packet
reordering.

Verifikasi bahwa ECMP bekerja:

```text
/ip/route/print where dst-address=0.0.0.0/0
Flags: D - dynamic, A - active, c - connect, s - static
 #      DST-ADDRESS        GATEWAY           DISTANCE
 0 As   0.0.0.0/0          203.0.113.1       1
                             198.51.100.1
```

Bendera `A` (active) muncul di kedua gateway — beda dengan failover biasa yang
hanya satu gateway aktif. Untuk pemeriksaan lebih dalam:

```bash
/ip/route/print detail where dst-address=0.0.0.0/0
```

Perhatikan kolom `gateway-status` — ia menunjukkan status tiap *next hop*
secara terpisah (`reachable` atau `unreachable`).

ECMP juga bisa dipasangkan dengan `check-gateway=ping`:

```bash
/ip/route/add dst-address=0.0.0.0/0 gateway=203.0.113.1,198.51.100.1 distance=1 \
  check-gateway=ping
```

Jika satu gateway mati, router otomatis mengeluarkannya dari daftar dan
meneruskan lewat yang tersisa — **load balancing dengan failover** dalam satu
baris.

## Policy routing: aturan rute berdasarkan asal

ECMP dan failover memutuskan ke mana paket pergi **berdasarkan tujuan**.
Policy routing (PBR) menambahkan dimensi baru: **dari mana paket berasal**.

Langkah-langkahnya:

1. **Buat tabel routing tambahan** — tabel default (`main`) tetap ada; kita
   buat tabel khusus untuk kelompok trafik tertentu:

```bash
/routing/table/add name=tabel-cabang fib
```

2. **Mark trafik berdasarkan asal** — mangle di firewall menandai paket sebelum
   routing mengambil keputusan:

```bash
/ip/firewall/mangle/add chain=prerouting src-address=192.0.2.128/26 \
  action=mark-routing new-routing-mark=via-vsat
```

3. **Arahkan ke tabel khusus** — rute default di tabel itu menentukan gateway
   yang berbeda dari trafik biasa:

```bash
/ip/route/add dst-address=0.0.0.0/0 gateway=198.51.100.1 routing-mark=via-vsat
```

Sekarang semua paket dari subnet `192.0.2.128/26` — misalnya jaringan tamu —
keluar lewat VSAT, sementara trafik lain tetap memakai tabel `main` dan keluar
lewat fiber.

**Contoh praktis — kantor dengan dua segmen:**

- **Guest WiFi** (`192.0.2.128/26`) → VSAT: bandwidth kecil, latency tinggi,
  tapi cukup untuk browsing dan email.
- **Staff LAN** (`192.0.2.0/25`) → Fiber: bandwidth besar, latency rendah
  untuk video conference dan VPN kantor pusat.

```bash
/routing/table/add name=via-vsat fib
/ip/firewall/mangle/add chain=prerouting src-address=192.0.2.128/26 \
  action=mark-routing new-routing-mark=via-vsat
/ip/route/add dst-address=0.0.0.0/0 gateway=198.51.100.1 routing-mark=via-vsat
```

::: tip Connection marking untuk konsistensi
Paket routing-mark berlaku per paket. Untuk protokol yang membutuhkan jalur
pulang sama (misalnya VoIP), tandai juga *connection*:

```bash
/ip/firewall/mangle/add chain=prerouting src-address=192.0.2.128/26 \
  action=mark-connection new-connection-mark=via-vsat-con
/ip/firewall/mangle/add chain=prerouting connection-mark=via-vsat-con \
  action=mark-routing new-routing-mark=via-vsat
```

Connection mark memastikan semua paket dalam satu sesi mendapat perlakuan
routing yang sama — krusial agar respon server kembali via VSAT, bukan
terlempar ke fiber.
:::

## Uji pemahaman

1. Tabel memuat `0.0.0.0/0 via A` dan `198.51.100.0/24 via B`; paket menuju
   `198.51.100.7` lewat mana? → **B** —
   [longest prefix match](/networking/routing#longest-prefix-match) mengalahkan
   default route.
2. Dua default route ber-distance 1 dan 2 — kapan yang kedua dipakai? →
   Saat rute pertama hilang/dinonaktifkan `check-gateway`; distance adalah
   urutan cadangan, bukan pembagi beban.
3. Apa fungsi `passive` di interface-template LAN? → Subnet tetap diumumkan,
   tapi OSPF tidak mencari neighbor di situ — hemat, dan menutup pintu
   neighbor palsu.

Paket sudah tahu jalan. Sekarang memutuskan siapa yang **boleh lewat** — dan
secepat apa: [Firewall & QoS](/mikrotik/firewall-qos).
