---
title: Bridging & Switching
---

# Bridging & Switching

Teori [Switching & VLAN](/networking/switching) bilang: switch belajar MAC,
VLAN memecah broadcast domain, trunk membawa banyak VLAN lewat tagging 802.1Q.
Di RouterOS, semua itu diwujudkan lewat satu objek: **bridge**.

## Bridge: switch virtual di dalam router

Bridge menggabungkan beberapa interface menjadi satu switch layer 2 — lengkap
dengan [MAC learning](/networking/switching#bagaimana-switch-belajar) dan
satu broadcast domain:

```
/interface/bridge/add name=bridge1 comment="switch LAN"
/interface/bridge/port/add bridge=bridge1 interface=ether2
/interface/bridge/port/add bridge=bridge1 interface=ether3
/interface/bridge/port/add bridge=bridge1 interface=ether4
```

- `bridge/add` — menciptakan switch virtualnya; bridge juga muncul sebagai
  interface biasa, jadi **IP router dipasang ke `bridge1`**, bukan ke salah
  satu port anggotanya:

```
/ip/address/add address=192.0.2.1/24 interface=bridge1
```

- `bridge/port/add` — memasukkan port sebagai anggota. Port anggota berstatus
  `S` (*slave*): identitas layer 3-nya melebur ke bridge.

Tabel MAC hasil *learning* bisa dilihat — bandingkan dengan
[teorinya](/networking/switching#bagaimana-switch-belajar):

```
/interface/bridge/host/print
#  Flags: D - dynamic, L - local
#  MAC-ADDRESS        ON-INTERFACE  BRIDGE
#  4C:5E:0C:11:22:33  ether2        bridge1
```

### Hardware offload: switch beneran, bukan CPU

Pada perangkat dengan chip switch, RouterOS menurunkan pekerjaan forwarding
ke silikon (*hardware offload*) — paket antar-port tidak menyentuh CPU sama
sekali, alias *wire speed*:

```
/interface/bridge/port/print
#  #  INTERFACE  BRIDGE   HW
#  0  ether2     bridge1  yes
```

- Kolom `HW` = offload aktif (bendera `H` di print ringkas). Fitur tertentu
  (mis. sebagian konfigurasi VLAN filtering di chip lama) memaksa forwarding
  kembali ke CPU — selalu cek kolom ini setelah mengubah bridge; jaringan
  "tiba-tiba lambat" sering bermula dari offload yang diam-diam mati.

## VLAN filtering: teori 802.1Q jadi tabel

Skenario klasik — satu trunk ke arah distribusi, dua access port
(persis contoh *Bridge VLAN Table* di manual resmi):

```
ether1 = trunk (VLAN 20 & 30, tagged)
ether2 = access VLAN 20 (untagged) → PC karyawan
ether3 = access VLAN 30 (untagged) → CCTV
```

Konfigurasinya tiga babak:

**1. Masukkan port dengan PVID untuk access:**

```
/interface/bridge/add name=bridge1 vlan-filtering=no
/interface/bridge/port/add bridge=bridge1 interface=ether1
/interface/bridge/port/add bridge=bridge1 interface=ether2 pvid=20
/interface/bridge/port/add bridge=bridge1 interface=ether3 pvid=30
```

- `pvid=20` — *Port VLAN ID*: semua frame **untagged** yang masuk `ether2`
  dicap VLAN 20; frame keluar ke arah PC dilepas cap-nya. Inilah definisi
  [access port](/networking/switching#trunk-dan-tagging-802-1q) dalam satu parameter.
- `vlan-filtering=no` dulu — susun tabel lengkap sebelum pagar diaktifkan,
  agar kamu tidak terkunci di luar.

**2. Isi tabel VLAN — siapa tagged, siapa untagged, per VLAN ID:**

```
/interface/bridge/vlan/add bridge=bridge1 tagged=ether1 untagged=ether2 vlan-ids=20
/interface/bridge/vlan/add bridge=bridge1 tagged=ether1 untagged=ether3 vlan-ids=30
```

- `tagged=ether1` — di trunk, frame keluar **membawa** tag 802.1Q.
- Baris pertama dibaca: "VLAN 20 boleh lewat `ether1` (bertag) dan `ether2`
  (polos)". Ini bentuk tabel dari aturan trunk/access yang di teori digambar
  sebagai diagram.

**3. Nyalakan pagarnya:**

```
/interface/bridge/set bridge1 vlan-filtering=yes
```

::: warning Jangan kunci diri sendiri
Bridge (CPU router) juga anggota VLAN. Jika kamu mengelola router lewat
`ether2` (VLAN 20), pastikan CPU ikut VLAN itu **sebelum** menyalakan
filtering — jika tidak, akses manajemenmu ikut terfilter:

```
/interface/bridge/vlan/set [find vlan-ids=20] untagged=bridge1,ether2
/interface/bridge/set bridge1 pvid=20
```

Dan lakukan semuanya dalam [Safe Mode](/mikrotik/manajemen#tata-bahasa-cli).
Jalan pulang terakhir selalu ada: [MAC-telnet](/mikrotik/akses-awal#lima-pintu-masuk).
:::

### Gateway antar-VLAN

Supaya VLAN 20 dan 30 bisa saling bicara (lewat layer 3, karena
[layer 2-nya sengaja dipisah](/networking/switching#antar-vlan-tetap-butuh-router)),
buat interface VLAN di atas bridge dan beri IP:

```
/interface/vlan/add name=vlan20 vlan-id=20 interface=bridge1
/interface/vlan/add name=vlan30 vlan-id=30 interface=bridge1
/ip/address/add address=192.0.2.1/26 interface=vlan20
/ip/address/add address=192.0.2.65/26 interface=vlan30
```

- Dua subnet `/26` bersebelahan — persis
  [contoh pembagian /24 menjadi /26](/networking/subnetting#contoh-dikerjakan-memecah-24-menjadi-4-subnet)
  di modul teori. Router kini menjadi *router-on-a-stick* bagi kedua VLAN,
  dan lalu lintasnya bisa disaring [firewall](/mikrotik/firewall-qos).

## STP dan loop protect

Bridge RouterOS menyalakan **RSTP** secara bawaan (`protocol-mode=rstp`) —
[pencegah loop layer 2](/networking/switching#spanning-tree-protocol-stp) itu
bekerja tanpa kamu minta. Lengkapi dengan penjaga kedua di port akses:

```
/interface/ethernet/set ether2 loop-protect=on
```

- *Loop protect* mengirim probe berkala; jika probe-nya kembali ke dirinya
  sendiri (ada yang mencolok kabel membentuk lingkaran — kejadian nyata di
  kantor mana pun), port dimatikan otomatis.

## Uji pemahaman

1. IP LAN dipasang di `ether2` yang berstatus slave bridge — kenapa jaringan
   kacau? → Alamat harus di **bridge**; port slave bukan lagi entitas L3.
2. Frame untagged masuk lewat trunk `ether1` (PVID bawaan 1) masuk ke VLAN
   berapa? → VLAN 1 — karena itu praktik rapi memberi trunk PVID khusus atau
   memfilter frame untagged (`frame-types=admit-only-vlan-tagged`).
3. Apa arti kolom `HW=yes` hilang setelah kamu mengubah konfigurasi bridge?
   → Forwarding pindah ke CPU; throughput turun — tinjau ulang fitur yang
   baru dinyalakan.

Layer 2 tertata. Sekarang layanan-layanan yang membuat LAN "hidup":
[DHCP, DNS & NAT](/mikrotik/dhcp-dns-nat).
