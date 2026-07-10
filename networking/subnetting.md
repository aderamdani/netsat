---
title: IP Addressing & Subnetting
---

# IP Addressing & Subnetting

Setiap perangkat di jaringan IP butuh alamat. Halaman ini membahas anatomi
alamat IPv4, notasi CIDR, cara membagi jaringan menjadi subnet, dan
VLSM — lengkap dengan resep hitung cepat yang bisa dikerjakan di kepala.

## Anatomi alamat IPv4

Alamat IPv4 adalah bilangan **32-bit**, ditulis sebagai empat oktet desimal:

```
192.168.10.25
↓ dalam biner (per oktet, 8 bit)
11000000.10101000.00001010.00011001
```

Setiap alamat terbagi dua bagian:

- **Network portion** — mengidentifikasi jaringannya (seperti nama jalan).
- **Host portion** — mengidentifikasi perangkat di dalamnya (seperti nomor rumah).

Pembatasnya ditentukan oleh **subnet mask** / panjang prefix.

## Notasi CIDR dan subnet mask

`192.168.10.0/24` berarti: 24 bit pertama adalah network, sisanya (8 bit) untuk
host. `/24` setara subnet mask `255.255.255.0`.

| Prefix | Subnet mask | Jumlah alamat | Host efektif |
| --- | --- | --- | --- |
| /30 | 255.255.255.252 | 4 | 2 (link antar-router) |
| /29 | 255.255.255.248 | 8 | 6 |
| /28 | 255.255.255.240 | 16 | 14 |
| /27 | 255.255.255.224 | 32 | 30 |
| /26 | 255.255.255.192 | 64 | 62 |
| /25 | 255.255.255.128 | 128 | 126 |
| /24 | 255.255.255.0 | 256 | 254 |
| /23 | 255.255.254.0 | 512 | 510 |
| /16 | 255.255.0.0 | 65.536 | 65.534 |

**Host efektif = 2ʰ − 2** (h = jumlah bit host), karena dua alamat selalu
tersita:

- **Network address** — semua bit host `0` (mis. `192.168.10.0`), nama subnet itu sendiri.
- **Broadcast address** — semua bit host `1` (mis. `192.168.10.255`), alamat "ke semua".

## Alamat khusus yang wajib hafal

| Blok | Fungsi |
| --- | --- |
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Privat (RFC 1918) — tidak dirutekan di internet |
| `127.0.0.0/8` | Loopback (localhost) |
| `169.254.0.0/16` | Link-local / APIPA — muncul saat DHCP gagal |
| `100.64.0.0/10` | CGNAT (dipakai ISP, termasuk **Starlink**) |
| `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` | Khusus dokumentasi (RFC 5737) — dipakai di seluruh situs ini |
| `224.0.0.0/4` | Multicast |

Alamat privat bisa mengakses internet lewat **NAT** (*Network Address
Translation*): router mengganti IP sumber privat dengan IP publiknya dan
mencatat pemetaannya. Praktis, tapi punya efek samping — koneksi masuk dari
luar tidak bisa langsung menjangkau perangkat di belakang NAT.

## Subnetting: membagi satu blok menjadi beberapa

Subnetting = **meminjam bit host untuk dijadikan bit network**. Setiap 1 bit
yang dipinjam menggandakan jumlah subnet dan membagi dua ukuran masing-masing.

### Contoh dikerjakan: memecah /24 menjadi 4 subnet

Diberikan `192.168.10.0/24`, butuh 4 subnet sama besar.

1. 4 subnet → butuh 2 bit tambahan (2² = 4) → prefix baru **/26**.
2. Ukuran tiap subnet: 2⁶ = 64 alamat → **kelipatan 64** di oktet terakhir.

| Subnet | Network | Rentang host | Broadcast |
| --- | --- | --- | --- |
| 1 | 192.168.10.0/26 | .1 – .62 | .63 |
| 2 | 192.168.10.64/26 | .65 – .126 | .127 |
| 3 | 192.168.10.128/26 | .129 – .190 | .191 |
| 4 | 192.168.10.192/26 | .193 – .254 | .255 |

### Resep hitung cepat

Untuk soal "IP `X` ada di subnet mana dengan prefix `/n`?":

1. **Block size** = 256 − nilai oktet mask yang menarik.
   Contoh /26 → mask 192 → block size 64.
2. Network address = kelipatan block size terbesar yang ≤ oktet IP.
3. Broadcast = network berikutnya − 1.

Contoh: `192.168.10.100/26` → kelipatan 64 di bawah 100 adalah 64 →
network `192.168.10.64`, broadcast `.127`, host valid `.65–.126`. Selesai,
tanpa konversi biner.

## VLSM: subnet dengan ukuran berbeda-beda

Dunia nyata jarang butuh subnet sama besar. VLSM (*Variable Length Subnet
Mask*) membagi blok sesuai kebutuhan — **selalu alokasikan dari yang terbesar
dulu** supaya tidak terjadi tumpang-tindih.

### Contoh dikerjakan: kantor dengan 4 kebutuhan

Blok `172.16.0.0/23` (512 alamat). Kebutuhan:
kantor A 200 host, kantor B 100 host, Wi-Fi tamu 50 host, dan 2 link
antar-router.

| Kebutuhan | Host | Prefix dipilih | Alokasi | Rentang host |
| --- | --- | --- | --- | --- |
| Kantor A | 200 | /24 (254 host) | 172.16.0.0/24 | .0.1 – .0.254 |
| Kantor B | 100 | /25 (126 host) | 172.16.1.0/25 | .1.1 – .1.126 |
| Wi-Fi tamu | 50 | /26 (62 host) | 172.16.1.128/26 | .1.129 – .1.190 |
| Link router 1 | 2 | /30 (2 host) | 172.16.1.192/30 | .1.193 – .1.194 |
| Link router 2 | 2 | /30 (2 host) | 172.16.1.196/30 | .1.197 – .1.198 |

Sisa `172.16.1.200 – 172.16.1.255` bisa dicadangkan untuk pertumbuhan.

::: tip Subnet /30 dan /31 di link VSAT
Link point-to-point — termasuk link antara modem [VSAT](/satelit/vsat) remote
dan router hub — hanya butuh 2 alamat. Karena itu /30 (atau /31, RFC 3021)
adalah standar de facto. Operator VSAT yang melayani ratusan remote menghemat
ribuan alamat dengan kebiasaan ini.
:::

## Supernetting / route aggregation

Kebalikan subnetting: menggabungkan beberapa blok menjadi satu rute ringkas.
`192.168.0.0/24` s.d. `192.168.3.0/24` bisa diumumkan sebagai satu rute
`192.168.0.0/22`. Inilah yang membuat tabel routing internet global "hanya"
±1 juta entri, bukan miliaran — detailnya di [Routing](/networking/routing#longest-prefix-match).

## Sekilas IPv6

Prinsipnya identik, angkanya raksasa:

- 128 bit, heksadesimal: `2001:db8:aa::1/64`.
- Subnet standar untuk LAN selalu **/64** — tidak perlu berhemat host.
- Organisasi biasanya menerima /48 (= 65.536 subnet /64).
- Tidak ada broadcast (diganti multicast), tidak butuh NAT.

Latihan subnetting IPv6 = latihan menghitung di kolom prefix saja, karena
bagian host praktis tak pernah habis.

## Uji pemahaman

1. Berapa host efektif di `10.10.4.0/22`? <br>→ 2¹⁰ − 2 = **1.022**
2. `203.0.113.77/27` — network dan broadcast-nya? <br>→ block size 32; network
   `203.0.113.64`, broadcast `203.0.113.95`
3. Butuh 6 subnet dari satu /24 — prefix barunya? <br>→ 3 bit (2³ = 8 ≥ 6) → **/27**
4. Dua router dihubungkan langsung — prefix paling hemat? <br>→ **/30** (atau /31)

Selanjutnya: alamat sudah tertata — sekarang bagaimana paket berpindah
antar-subnet? Lanjut ke [Routing](/networking/routing).
