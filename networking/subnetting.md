---
title: IP Addressing & Subnetting
---

# IP Addressing & Subnetting

Setiap perangkat di jaringan IP butuh alamat. Halaman ini membahas anatomi
alamat IPv4, notasi CIDR, cara membagi jaringan menjadi subnet, dan
VLSM — lengkap dengan resep hitung cepat yang bisa dikerjakan di kepala.

## Anatomi alamat IPv4

Alamat IPv4 adalah bilangan **32-bit**, ditulis sebagai empat oktet desimal:

| Oktet 1 | Oktet 2 | Oktet 3 | Oktet 4 |
| :---: | :---: | :---: | :---: |
| **`192`** | **`168`** | **`10`** | **`25`** |
| `11000000` | `10101000` | `00001010` | `00011001` |

Setiap alamat terbagi dua bagian:

- **Network portion** — mengidentifikasi jaringannya (seperti nama jalan).
- **Host portion** — mengidentifikasi perangkat di dalamnya (seperti nomor rumah).

Pembatasnya ditentukan oleh **subnet mask** / panjang prefix.

::: info Analogi alamat rumah
`192.168.10.25/24` ≈ "Jalan Melati **(192.168.10)** No. **25**". Router hanya
membaca nama jalannya untuk mengantarkan paket ke jalan yang benar; nomor
rumah baru dipedulikan setelah sampai di jalan itu. Subnet mask adalah garis
yang memisahkan "nama jalan" dari "nomor rumah".
:::

### Bekal biner 5 menit

Subnetting jadi mudah begitu kamu hafal **nilai posisi 8 bit**:

| Posisi Bit | `128` | `64` | `32` | `16` | `8` | `4` | `2` | `1` | Hasil Akhir |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| **Contoh 1** | `1` | `1` | `0` | `0` | `0` | `0` | `0` | `0` | 128 + 64 = **192** |
| **Contoh 2** | `1` | `1` | `1` | `0` | `0` | `0` | `0` | `0` | 128 + 64 + 32 = **224** |

Dua konversi yang sering muncul:

- **Desimal → biner**: kurangi berulang dari kiri. 25 = 16+8+1 → `00011001`.
- **Mask → prefix**: hitung bit 1 berurutan dari kiri. `255.255.255.224` =
  8+8+8+3 = **/27**.

Deret nilai oktet mask hanya ada 9 kemungkinan — hafalkan sekali, pakai
selamanya: **0, 128, 192, 224, 240, 248, 252, 254, 255**
(masing-masing = 0–8 bit menyala dari kiri).

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

| Sumber (Private) | | Router NAT | | Tujuan (Internet) |
| :--- | :---: | :---: | :---: | :--- |
| **`Laptop`**<br>`192.168.1.7:51000` | ──▶ | **Tabel NAT:**<br>`192.168.1.7:51000 ⇄ 36.68.x.x:60123` | ──▶ | **Internet melihat:**<br>`36.68.x.x:60123` |

Satu IP publik bisa dipakai ratusan perangkat karena pembedanya bukan IP saja
tapi **pasangan IP:port**. ISP bahkan menumpuk NAT dua tingkat (**CGNAT**,
blok `100.64.0.0/10` di tabel atas): pelangganpun tidak mendapat IP publik
sungguhan — alasan kenapa hosting server dari rumah (atau dari terminal
Starlink) sering tidak bisa tanpa bantuan tunnel/VPN.

## Subnetting: membagi satu blok menjadi beberapa

Subnetting = **meminjam bit host untuk dijadikan bit network**. Setiap 1 bit
yang dipinjam menggandakan jumlah subnet dan membagi dua ukuran masing-masing.

### Contoh dikerjakan: memecah /24 menjadi 4 subnet

<details>
<summary>Lihat pembahasan</summary>


Diberikan `192.168.10.0/24`, butuh 4 subnet sama besar.

1. 4 subnet → butuh 2 bit tambahan (2² = 4) → prefix baru **/26**.
2. Ukuran tiap subnet: 2⁶ = 64 alamat → **kelipatan 64** di oktet terakhir.

| Subnet | Network | Rentang host | Broadcast |
| --- | --- | --- | --- |
| 1 | 192.168.10.0/26 | .1 – .62 | .63 |
| 2 | 192.168.10.64/26 | .65 – .126 | .127 |
| 3 | 192.168.10.128/26 | .129 – .190 | .191 |
| 4 | 192.168.10.192/26 | .193 – .254 | .255 |


</details>

### Resep hitung cepat

Untuk soal "IP `X` ada di subnet mana dengan prefix `/n`?":

1. **Block size** = 256 − nilai oktet mask yang menarik.
   Contoh /26 → mask 192 → block size 64.
2. Network address = kelipatan block size terbesar yang ≤ oktet IP.
3. Broadcast = network berikutnya − 1.

Contoh: `192.168.10.100/26` → kelipatan 64 di bawah 100 adalah 64 →
network `192.168.10.64`, broadcast `.127`, host valid `.65–.126`. Selesai,
tanpa konversi biner.

Satu contoh lagi dengan prefix yang "menarik" di oktet ketiga:
`172.16.37.200/20` → mask `255.255.240.0` → block size di **oktet ketiga**
= 256 − 240 = 16 → kelipatan 16 di bawah 37 adalah 32 → network
`172.16.32.0`, broadcast `172.16.47.255`. Aturannya sama, hanya pindah kolom.

::: tip Dua pertanyaan, satu resep
Semua soal subnetting pada dasarnya hanya dua bentuk: **(a)** "IP ini anggota
subnet mana?" → resep block size di atas; **(b)** "butuh N subnet / N host,
prefix berapa?" → cari pangkat 2 terdekat (untuk host ingat −2). Kalau kamu
bisa menjawab dua bentuk itu tanpa kalkulator, kamu sudah selesai dengan
subnetting.
:::

## VLSM: subnet dengan ukuran berbeda-beda

Dunia nyata jarang butuh subnet sama besar. VLSM (*Variable Length Subnet
Mask*) membagi blok sesuai kebutuhan — **selalu alokasikan dari yang terbesar
dulu** supaya tidak terjadi tumpang-tindih.

### Contoh dikerjakan: kantor dengan 4 kebutuhan

<details>
<summary>Lihat pembahasan</summary>


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


</details>

## Supernetting / route aggregation

Kebalikan subnetting: menggabungkan beberapa blok menjadi satu rute ringkas.
`192.168.0.0/24` s.d. `192.168.3.0/24` bisa diumumkan sebagai satu rute
`192.168.0.0/22`. Inilah yang membuat tabel routing internet global "hanya"
±1 juta entri, bukan miliaran — detailnya di [Routing](/networking/routing#longest-prefix-match).

## Deep-Dive IPv6 & Subnetting

Prinsip dasar pembagian prefix pada IPv6 sama dengan IPv4 (menggunakan notasi CIDR), namun IPv6 memiliki ukuran alamat raksasa sebesar **128 bit** yang ditulis dalam format heksadesimal (8 grup x 16 bit, dipisahkan oleh titik dua `:`).

Format dasar IPv6:
`2001:0db8:85a3:0000:0000:8a2e:0370:7334`

### 1. Aturan Penulisan Singkat (Kompresi IPv6)
Untuk mempermudah penulisan, terdapat dua aturan resmi:
1. **Omit Leading Zeros:** Nol di depan setiap grup boleh dihapus.
   * `0db8` menjadi `db8`
   * `0000` menjadi `0`
2. **Double Colon (`::`):** Satu blok atau lebih grup nol berurutan dapat diganti dengan titik dua ganda `::`. Aturan ini **hanya boleh digunakan sekali** dalam satu alamat untuk menghindari ambiguitas.
   * Contoh: `2001:db8:85a3:0:0:8a2e:370:7334` ──▶ `2001:db8:85a3::8a2e:370:7334`

---

### 2. Anatomi Alamat IPv6
Secara default, alamat IPv6 standar untuk pengguna akhir (LAN) adalah **/64**. Alamat ini dibagi menjadi dua bagian sama besar:

```
┌───────────────────────────────── 128 Bit ─────────────────────────────────┐
│              Network Prefix (64 Bit)              │   Interface ID (64 Bit)   │
├───────────────────────────────────┼───────────────┼───────────────────────┤
│    Global Routing Prefix (48 Bit) │ Subnet (16 Bit)│   MAC / Random (64)   │
└───────────────────────────────────┴───────────────┴───────────────────────┘
```

* **Network Prefix (64 bit pertama):** Digunakan untuk proses routing di internet dan lokal.
  * **Global Routing Prefix (biasanya 48 bit pertama):** Blok alamat yang diberikan oleh ISP ke organisasi/pelanggan.
  * **Subnet ID (16 bit berikutnya):** Digunakan oleh internal administrator untuk membagi segmen jaringan (menghasilkan hingga 2¹⁶ = 65.536 subnet /64).
* **Interface ID (64 bit terakhir):** Identitas unik fisik host (seperti MAC Address yang diubah dengan metode EUI-64 atau diacak demi privasi).

---

### 3. Jenis Alamat IPv6 Terpenting

| Jenis Alamat | Prefix | Fungsi & Analogi IPv4 | Contoh Alamat |
| --- | --- | --- | --- |
| **Global Unicast Address (GUA)** | `2000::/3` (Dimulai dengan angka `2` atau `3`) | IP Publik internet. Dapat dirutekan secara global di internet tanpa NAT. | `2001:db8::1` |
| **Link-Local Address (LLA)** | `fe80::/10` | IP otomatis per interface (seperti APIPA `169.254.x.x`). Digunakan untuk komunikasi lokal satu segmen fisik LAN (misal: bertukar routing protocol). | `fe80::e02:9eff:fe88:12` |
| **Unique Local Address (ULA)** | `fc00::/7` (Seringnya `fd00::/8`) | IP Privat lokal (seperti `192.168.x.x`). Tidak dapat dirutekan ke internet. | `fd00:1234:5678::1` |
| **Loopback Address** | `::1/128` | Localhost (`127.0.0.1`). | `::1` |
| **Default Route** | `::/0` | Default route (`0.0.0.0/0`). | `::/0` |

---

### 4. Perencanaan Subnetting IPv6
Karena jumlah alamat host dalam satu prefix `/64` adalah 2⁶⁴ ≈ 18 triliun host, kita **tidak pernah melakukan subnetting di bawah /64** (seperti membuat /70 atau /80) untuk jaringan LAN. Hal ini dikarenakan fitur otomatisasi seperti **SLAAC (Stateless Address Autoconfiguration)** membutuhkan prefix tepat `/64` untuk bekerja.

Subnetting IPv6 dilakukan dengan membagi blok besar (biasanya `/48` atau `/56` dari ISP) pada blok 16-bit Subnet ID.

**Contoh Kasus:**
ISP memberikan alokasi IPv6 block **`2001:db8:cafe::/48`** ke kantor Anda. Anda diminta membagi blok ini ke 3 segmen LAN dan 1 link point-to-point.

Satu blok `/48` memiliki 16 bit kosong sebelum mencapai batas standar `/64` (`64 - 48 = 16 bit`). Kita cukup mengganti karakter heksadesimal pada digit grup ke-4:

`2001:0db8:cafe:[SUBNET]::/64`

* **LAN 1 (Staff):** `2001:db8:cafe:0001::/64` (singkat: `2001:db8:cafe:1::/64`)
* **LAN 2 (Guest):** `2001:db8:cafe:0002::/64` (singkat: `2001:db8:cafe:2::/64`)
* **LAN 3 (Server):** `2001:db8:cafe:000a::/64` (singkat: `2001:db8:cafe:a::/64`)
* **Link Router-to-Router:** `2001:db8:cafe:ffff::/64` (singkat: `2001:db8:cafe:ffff::/64`)

*Keuntungan Subnetting IPv6:* Sangat mudah dibaca secara visual dan tidak membutuhkan konversi biner yang rumit seperti IPv4, karena pembagian batas subnet bertepatan dengan batas karakter heksadesimal (setiap 1 karakter heksadesimal mewakili 4 bit).

---

## Uji pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Berapa host efektif di `10.10.4.0/22`? <br>→ 2¹⁰ − 2 = **1.022**
2. `203.0.113.77/27` — network dan broadcast-nya? <br>→ block size 32; network
   `203.0.113.64`, broadcast `203.0.113.95`
3. Butuh 6 subnet dari satu /24 — prefix barunya? <br>→ 3 bit (2³ = 8 ≥ 6) → **/27**
4. Dua router dihubungkan langsung — prefix paling hemat? <br>→ **/30** (atau /31)
5. `172.16.44.10/20` dan `172.16.50.10/20` — satu subnet atau beda? <br>→
   Block size 16 di oktet ketiga: 44 jatuh di blok 32–47, 50 jatuh di blok
   48–63 → **beda subnet**, perlu router untuk saling bicara.
6. Ponselmu di rumah mendapat IP `100.72.3.9`. Artinya? <br>→ Kamu di belakang
   **CGNAT** ISP (blok 100.64.0.0/10) — tidak punya IP publik sendiri.

**Praktik:** pasang alamat dan prefix hasil hitunganmu ke router sungguhan di
[Interface & IP Address (MikroTik)](/mikrotik/interface-ip).

Selanjutnya: alamat sudah tertata — sekarang bagaimana paket berpindah
antar-subnet? Lanjut ke [Routing](/networking/routing).

</details>