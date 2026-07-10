---
title: DHCP, DNS & NAT
---

# DHCP, DNS & NAT

Tiga layanan yang membuat "colok kabel langsung internet" terasa ajaib:
[DHCP](/networking/protokol#dhcp) membagikan alamat, [DNS](/networking/protokol#dns)
menerjemahkan nama, dan NAT menyelundupkan seisi LAN ke internet lewat satu IP
publik. Halaman ini memasang ketiganya di RouterOS.

Topologi acuan untuk seluruh contoh:

```
internet ── ether1 (WAN, 203.0.113.2/24) ─ ROUTER ─ bridge1 (LAN, 192.0.2.1/24) ── klien
```

## DHCP client (sisi WAN)

Kalau ISP/modem membagikan IP otomatis, cukup satu baris — sintaks persis
dari manual resmi:

```
/ip/dhcp-client/add interface=ether1 disabled=no
```

- Selain alamat, client menerima gateway (dipasang sebagai
  [default route](/mikrotik/routing#rute-statis-dan-default-route) dinamis) dan server DNS.
- Cek hasil sewanya: `/ip/dhcp-client/print` — status harus `bound`.

## DHCP server (sisi LAN)

Empat langkah yang memetakan langsung ke
[teori DORA](/networking/protokol#dhcp):

**1. Kolam alamat yang boleh dibagikan:**

```
/ip/pool/add name=pool-lan ranges=192.0.2.10-192.0.2.199
```

- Rentang sengaja menyisakan `.1–.9` dan `.200–.254` untuk perangkat statis
  (router, printer, server) — kebiasaan yang menghindarkan konflik alamat.

**2. Server-nya, menempel di interface LAN:**

```
/ip/dhcp-server/add name=dhcp-lan interface=bridge1 address-pool=pool-lan lease-time=1h
```

- `lease-time=1h` — [masa sewa](/networking/protokol#dhcp); pendek = adaptif
  untuk jaringan tamu yang datang-pergi, panjang (mis. `1d`) = tenang untuk
  kantor.

**3. Amplop jawaban OFFER/ACK — gateway & DNS yang dibagikan:**

```
/ip/dhcp-server/network/add address=192.0.2.0/24 gateway=192.0.2.1 dns-server=192.0.2.1
```

- `dns-server=192.0.2.1` — klien disuruh bertanya DNS ke **router sendiri**
  (lihat DNS cache di bawah) — pola paling umum.

**4. Kunci alamat perangkat penting** (*static lease*):

```
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

```
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

```
/ip/firewall/filter/add chain=input in-interface=ether1 protocol=udp dst-port=53 action=drop
/ip/firewall/filter/add chain=input in-interface=ether1 protocol=tcp dst-port=53 action=drop
```

Konteks lengkap aturan firewall ada di [bab berikutnya](/mikrotik/firewall-qos).
:::

## NAT

### Masquerade: seisi LAN menumpang satu IP publik

Teorinya di [modul subnetting](/networking/subnetting#alamat-khusus-yang-wajib-hafal):
alamat privat tak dirutekan di internet, maka router menyamarkannya:

```
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

```
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

```
/ip/firewall/connection/print where dst-address~"192.0.2.200"
```

- Tabel *connection tracking* menampilkan pemetaan asli ↔ tersamar — jantung
  NAT (dan [firewall stateful](/mikrotik/firewall-qos#connection-tracking-ingatan-firewall))
  yang dibahas bab berikutnya.

## Uji pemahaman

1. Klien mendapat IP `169.254.x.x` — apa hipotesis pertamamu? →
   [DHCP gagal](/networking/protokol#dhcp): server mati, kabel/VLAN salah,
   atau pool habis. Cek `/ip/dhcp-server/print` dan lease-nya.
2. Kenapa masquerade memakai `out-interface`, bukan `src-address`? → Lebih
   tahan perubahan: berapa pun subnet LAN kelak, semua yang keluar WAN
   tersamar. (Menambah `src-address=192.0.2.0/24` lebih ketat — juga sah.)
3. dst-nat sudah benar tapi tetangga satu LAN tak bisa akses
   `203.0.113.2:8080` — fenomena apa ini? → *Hairpin NAT*: trafik LAN→IP
   publik→LAN butuh aturan masquerade tambahan untuk arah baliknya.

Alamat beres, nama beres, penyamaran beres. Berikutnya: mengarahkan paket ke
jalur yang benar — [Routing di RouterOS](/mikrotik/routing).
