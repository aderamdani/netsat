---
title: DHCP, DNS & NAT
---

# DHCP, DNS & NAT

Tiga layanan yang membuat "colok kabel langsung internet" terasa ajaib:
[DHCP](/networking/protokol#dhcp) membagikan alamat, [DNS](/networking/protokol#dns)
menerjemahkan nama, dan NAT menyelundupkan seisi LAN ke internet lewat satu IP
publik. Halaman ini memasang ketiganya di RouterOS.

Topologi acuan untuk seluruh contoh:

```mermaid
flowchart LR
    INT[internet] --> WAN["ether1<br/>WAN, 203.0.113.2/24"]
    WAN --> R[ROUTER]
    R --> LAN["bridge1<br/>LAN, 192.0.2.1/24"]
    LAN --> K[klien]
```
*Topologi acuan yang dipakai di seluruh contoh DHCP/DNS/NAT pada halaman ini.*

## DHCP client (sisi WAN)

Kalau ISP/modem membagikan IP otomatis, cukup satu baris — sintaks persis
dari manual resmi:

```bash
/ip/dhcp-client/add interface=ether1 disabled=no
```

- Selain alamat, client menerima gateway (dipasang sebagai
  [default route](/mikrotik/routing#rute-statis-dan-default-route) dinamis) dan server DNS.
- Cek hasil sewanya: `/ip/dhcp-client/print` — status harus `bound`.

## DHCP server (sisi LAN)

Empat langkah yang memetakan langsung ke
[teori DORA](/networking/protokol#dhcp):

**1. Kolam alamat yang boleh dibagikan:**

```bash
/ip/pool/add name=pool-lan ranges=192.0.2.10-192.0.2.199
```

- Rentang sengaja menyisakan `.1–.9` dan `.200–.254` untuk perangkat statis
  (router, printer, server) — kebiasaan yang menghindarkan konflik alamat.

**2. Server-nya, menempel di interface LAN:**

```bash
/ip/dhcp-server/add name=dhcp-lan interface=bridge1 address-pool=pool-lan lease-time=1h
```

- `lease-time=1h` — [masa sewa](/networking/protokol#dhcp); pendek = adaptif
  untuk jaringan tamu yang datang-pergi, panjang (mis. `1d`) = tenang untuk
  kantor.

**3. Amplop jawaban OFFER/ACK — gateway & DNS yang dibagikan:**

```bash
/ip/dhcp-server/network/add address=192.0.2.0/24 gateway=192.0.2.1 dns-server=192.0.2.1
```

- `dns-server=192.0.2.1` — klien disuruh bertanya DNS ke **router sendiri**
  (lihat DNS cache di bawah) — pola paling umum.

**4. Kunci alamat perangkat penting** (*static lease*):

```bash
/ip/dhcp-server/lease/add address=192.0.2.200 mac-address=4C:5E:0C:11:22:33 comment="printer"
```

- MAC itu selalu menerima `.200` — kepastian ala statis, kepraktisan ala DHCP.

::: tip Jalan pintas
`/ip/dhcp-server/setup` menanyakan interface, subnet, pool, gateway, DNS satu
per satu dan membuat keempat objek di atas otomatis. Cepat — tapi sekarang
kamu tahu persis apa yang ia buat.
:::

## DNS: router sebagai cache

Aktifkan resolver di router supaya seisi LAN menikmati
[cache](/networking/protokol#hierarki-dan-proses-resolusi) bersama:

```bash
/ip/dns/set servers=9.9.9.9,149.112.112.112 allow-remote-requests=yes
/ip/dns/static/add name=printer.kantor.local address=192.0.2.200
```

- `servers=` — resolver hulu tempat router bertanya bila cache kosong.
- `allow-remote-requests=yes` — router mau menjawab pertanyaan DNS dari
  klien (bukan cuma untuk dirinya).
- `dns/static/add` — rekaman lokal ala
  [A record](/networking/protokol#jenis-rekaman-penting) untuk nama-nama internal.

::: warning allow-remote-requests = kewajiban firewall
Dengan opsi itu menyala, router menjawab **siapa pun** yang bertanya —
termasuk dari internet, menjadikanmu *open resolver* yang ditunggangi
[serangan DDoS](/networking/keamanan#serangan-yang-wajib-dipahami-cara-kerjanya)
amplifikasi. Wajib tutup port 53 dari WAN:

```bash
/ip/firewall/filter/add chain=input in-interface=ether1 protocol=udp dst-port=53 action=drop
/ip/firewall/filter/add chain=input in-interface=ether1 protocol=tcp dst-port=53 action=drop
```

Konteks lengkap aturan firewall ada di [bab berikutnya](/mikrotik/firewall-qos).
:::

## NAT

### Masquerade: seisi LAN menumpang satu IP publik

Teorinya di [modul subnetting](/networking/subnetting#alamat-khusus-yang-wajib-hafal):
alamat privat tak dirutekan di internet, maka router menyamarkannya:

```bash
/ip/firewall/nat/add chain=srcnat out-interface=ether1 action=masquerade
```

- `chain=srcnat` — mengubah **alamat sumber** paket yang keluar.
- `out-interface=ether1` — hanya untuk trafik yang keluar lewat WAN.
- `action=masquerade` — ganti IP sumber dengan alamat interface keluar,
  berapa pun nilainya saat itu — pas untuk IP WAN dinamis. (Jika IP publik
  statis, `action=src-nat to-addresses=203.0.113.2` sedikit lebih ringan.)

### dst-nat: membuka layanan ke dalam (port forward)

Kebalikan masquerade — koneksi masuk dari internet dibelokkan ke server LAN.
Contoh: web server internal `192.0.2.200:80` dibuka lewat port publik 8080:

```bash
/ip/firewall/nat/add chain=dstnat in-interface=ether1 protocol=tcp dst-port=8080 \
  action=dst-nat to-addresses=192.0.2.200 to-ports=80
```

- `chain=dstnat` — mengubah **alamat tujuan** sebelum keputusan routing.
- `dst-port=8080` → `to-ports=80` — port luar dan dalam tak harus sama;
  publik mengetuk 8080, server tetap mendengar di 80.
- Ingat konsekuensi teorinya: inilah jawaban praktis atas "koneksi masuk
  tidak bisa menembus [NAT](/networking/subnetting#alamat-khusus-yang-wajib-hafal)" —
  kamu membuat pengecualian secara eksplisit, satu layanan satu aturan.

Lihat NAT bekerja secara langsung:

```bash
/ip/firewall/connection/print where dst-address~"192.0.2.200"
```

- Tabel *connection tracking* menampilkan pemetaan asli ↔ tersamar — jantung
  NAT (dan [firewall stateful](/mikrotik/firewall-qos#connection-tracking-ingatan-firewall))
  yang dibahas bab berikutnya.

## Hairpin NAT: membuka lubang untuk diri sendiri

dst-nat di atas bekerja sempurna dari internet, tapi klien di LAN sendiri
tak bisa mengakses `203.0.113.2:8080` untuk mencapai server `192.0.2.200`.
Kenapa? Karena router melihat paket dari LAN ke IP publik sebagai koneksi
*lokal* — ia kirim balik jawaban langsung ke klien, tapi klien mengirim
ke IP publik dan mengharapkan jawaban dari IP publik, bukan dari `192.0.2.200`.
Koneksi *reset*.

Solusinya: aturan src-nat tambahan yang **memaksa** trafik LAN → dst-nat
agar kembali melalui router:

```bash
/ip/firewall/nat/add chain=srcnat src-address=192.0.2.0/24 dst-address=192.0.2.200 \
  protocol=tcp dst-port=80 action=masquerade
```

- Aturan ini harus ditempatkan **sebelum** aturan dst-nat — urutan NAT
  diproses berurutan.
- `src-address=192.0.2.0/24` membatasi hanya klien LAN.
- `dst-address=192.0.2.200 protocol=tcp dst-port=80` mencocokkan tujuan
  yang sama dengan dst-nat.
- `action=masquerade` membuat router bertindak sebagai perantara: klien
  melihat koneksi berasal dari router, server LAN membalas ke router, router
  meneruskan ke klien — semua dalam IP publik yang konsisten.

Alternatif yang lebih bersih: gunakan chain `dstnat` dengan
`src-address`:

```bash
/ip/firewall/nat/add chain=dstnat src-address=192.0.2.0/24 dst-address=203.0.113.2 \
  protocol=tcp dst-port=8080 action=dst-nat to-addresses=192.0.2.200 to-ports=80
```

Pendekatan ini memisahkan aturan LAN dan aturan internet tanpa perlu
src-nat terpisah — tapi hanya berlaku kalau klien mencoba IP publik router.

## DNS over HTTPS: privasi di tingkat DNS

RouterOS v7 mendukung DNS over HTTPS — query DNS dikirim lewat HTTPS
terenkripsi, bukan plaintext UDP:

```bash
/ip/dns/set use-doh-server=https://dns.quad9.net/dns-query verify-doh-cert=yes
```

- `use-doh-server=` — URL server DoH. [Quad9](https://www.quad9.net/)
  (9.9.9.9), Cloudflare (`https://cloudflare-dns.com/dns-query`), atau
  Google (`https://dns.google/dns-query`) adalah pilihan umum.
- `verify-doh-cert=yes` — periksa sertifikat TLS server DoH. Matikan hanya
  kalau pakai server internal dengan sertifikat *self-signed*.
- **Fallback**: baris `servers=9.9.9.9,149.112.112.112` masih tetap
  berfungsi — bila DoH gagal, router turun ke DNS biasa.

Verifikasi:

```bash
/ip/dns/print
```

Perhatikan kolom `doh-server-status`: `"OK"` berarti koneksi DoH aktif.

::: caveat DoH bukan perak cepat
DoH menambahkan *latency* karena setiap query butuh *handshake* TLS dan
*round-trip* HTTP. Cocok untuk LAN kantor/rumah dengan koneksi stabil.
Untuk link VSAT (satelit) yang sudah laten tinggi, DoH bisa terasa lamban
— pertimbangkan DNS plain lewat resolver lokal atau DoH dengan *cache* yang
agresif.
:::

## DDNS: IP dinamis, nama tetap

ISP residensial umumnya mengganti IP publik secara periodik. DDNS memastikan
nama domain (mis. `rumahku.example.com`) selalu menunjuk ke IP router
terkini.

**DDNS bawaan MikroTik** (gratis, tanpa konfigurasi domain sendiri):

```bash
/ip/cloud/ddns/set enabled=yes
```

- Router otomatis mendaftarkan IP WAN-nya ke layanan MikroTik.
- Kamu mendapat nama seperti `xxxxxx.sn.mynetname.net` — xxxxxx adalah
  nomor seri router.
- Cek nama yang diberikan:

```bash
/ip/cloud/print
```

Output mencakup `ddns-enabled: yes`, `ddns-update-interval`, dan
`public-address` IP WAN saat ini.

**DDNS kustom** (domain sendiri — mis. `rumahku.example.com`):

RouterOS tak punya menu DDNS untuk provider pihak ketiga. Solusinya:
skrip + scheduler + `/tool/fetch` untuk memanggil API provider.

Contoh skrip untuk Cloudflare:

```bash
:local token "api-token-anda"
:local zone "example.com"
:local record "rumahku"
:local wanip [/ip/address/get [find interface=ether1] address]
:local wanip [:pick $wanip 0 [:find $wanip "/"]]

/tool/fetch \
  http-method=put \
  http-header="Authorization: Bearer $token" \
  http-header="Content-Type: application/json" \
  url="https://api.cloudflare.com/client/v4/zones/$zone/dns_records/$record" \
  body="{\"type\":\"A\",\"name\":\"$record\",\"content\":\"$wanip\",\"ttl\":120}"
```

Jalankan skrip tiap 5 menit lewat scheduler:

```bash
/system/scheduler/add name=update-ddns interval=5m on-event="/system/script/run cloudflare-ddns"
```

## DHCP relay: satu server untuk banyak segmen

Dalam jaringan dengan banyak VLAN, kamu tidak perlu memasang DHCP server
di tiap segmen. Cukup satu server pusat, dan sisanya dilayani oleh *relay*:

```bash
/ip/dhcp-relay/add name=relay-vlan10 interface=vlan10 dhcp-server=192.0.2.10
```

- `name=` — nama bebas, urusannya cuma agar rapi di daftar.
- `interface=vlan10` — interface tempat relay mendengarkan *broadcast*
  DHCP klien.
- `dhcp-server=192.0.2.10` — alamat DHCP server pusat.

**Cara kerja:**
1. Klien di VLAN 10 mengirim DISCOVER broadcast ke `255.255.255.255`.
2. Relay di `vlan10` menerima broadcast, lalu meneruskannya sebagai
   **unicast** ke `192.0.2.10`.
3. Server membalas OFFER ke relay, relay menyebarkannya kembali ke klien
   sebagai broadcast.

**Prasyarat:**
- Interface relay harus punya alamat IP di segmen tersebut (agar relay
  dan klien satu subnet).
- Rute antara segmen relay dan segmen server harus tersedia — biasanya
  lewat *inter-VLAN routing* di router yang sama.
- Pastikan DHCP server punya **network definition** untuk subnet VLAN 10:

```bash
/ip/dhcp-server/network/add address=10.0.10.0/24 gateway=10.0.10.1 dns-server=192.0.2.1
```

Tanpa baris ini, server tak tahu gateway dan DNS apa yang harus
diberikan ke klien di VLAN 10.

## Cek pemahaman

1. Klien mendapat IP `169.254.x.x` — apa hipotesis pertamamu?
2. Kenapa masquerade memakai `out-interface`, bukan `src-address`?
3. dst-nat sudah benar tapi tetangga satu LAN tak bisa akses
   `203.0.113.2:8080` — fenomena apa ini?

<details>
<summary>Lihat jawaban</summary>

1. [DHCP gagal](/networking/protokol#dhcp): server mati, kabel/VLAN salah,
   atau pool habis. Cek `/ip/dhcp-server/print` dan lease-nya.
2. Lebih tahan perubahan: berapa pun subnet LAN kelak, semua yang keluar WAN
   tersamar. (Menambah `src-address=192.0.2.0/24` lebih ketat — juga sah.)
3. *Hairpin NAT*: trafik LAN→IP publik→LAN butuh aturan masquerade
   tambahan untuk arah baliknya.

</details>

Alamat beres, nama beres, penyamaran beres. Berikutnya: mengarahkan paket ke
jalur yang benar — [Routing di RouterOS](/mikrotik/routing).