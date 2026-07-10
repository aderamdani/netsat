---
title: VPN
---

# VPN

Teorinya di [Keamanan Jaringan](/networking/keamanan#vpn-terowongan-terenkripsi):
VPN membungkus trafik dalam terowongan terenkripsi melewati jaringan yang tak
dipercaya. RouterOS menyediakan hampir semua rasa — halaman ini memandu
memilih, lalu mengkonfigurasi yang paling layak dipakai hari ini.

## Memilih protokol

| Protokol | Transport | Keamanan | Kecepatan | Kapan dipakai |
| --- | --- | --- | --- | --- |
| **WireGuard** | UDP | Modern | Tercepat | Bawaan pilihan: site-to-site & roadwarrior |
| **IPsec (IKEv2)** | UDP/ESP | Kuat, tersertifikasi | Cepat (hw accel) | Interop antar-vendor, kepatuhan korporat |
| **L2TP/IPsec** | UDP | Kuat | Sedang | Klien bawaan OS lama tanpa aplikasi tambahan |
| **PPTP** | TCP+GRE | **Rusak** | — | Tidak. Warisan yang harus dimatikan |
| **EoIP** | GRE | Tanpa enkripsi sendiri | Cepat | Menjembatani **layer 2** antar-situs (khas MikroTik) |

Dua catatan pemilihan:

- **EoIP** bukan pesaing WireGuard — ia menerowongkan *frame Ethernet*
  ([layer 2](/networking/model-osi#layer-2-—-data-link)!), sehingga dua kantor
  bisa se-broadcast-domain. Praktik umum: EoIP **di atas** WireGuard/IPsec
  agar terenkripsi.
- Semua VPN berbasis **UDP** lebih sehat di jalur jauh; alasan teoretisnya
  (TCP-over-TCP, PEP satelit) di bagian bawah halaman.

## WireGuard site-to-site

Skenario: kantor pusat (LAN `192.0.2.0/24`, IP publik `203.0.113.2`) ↔
kantor cabang (LAN `198.51.100.0/24`). Terowongan memakai subnet internal
`172.16.0.0/30` (blok privat [RFC 1918](/networking/subnetting#alamat-khusus-yang-wajib-hafal),
[/30 untuk p2p](/networking/subnetting#vlsm-subnet-dengan-ukuran-berbeda-beda)).

**Di kantor pusat:**

```
/interface/wireguard/add name=wireguard1 listen-port=13231
/interface/wireguard/print
```

- `add` otomatis membangkitkan sepasang kunci; `print` menampilkan
  **public key** — salin untuk diberikan ke cabang. Kunci privat tak pernah
  meninggalkan perangkat (model kriptografi
  [asimetris](/networking/keamanan#kriptografi-dalam-dua-paragraf) bekerja).

```
/ip/address/add address=172.16.0.1/30 interface=wireguard1
/interface/wireguard/peers/add interface=wireguard1 name=ke-cabang \
  public-key="PUBKEY_CABANG_DI_SINI" allowed-address=172.16.0.2/32,198.51.100.0/24
```

- `allowed-address` — dua peran sekaligus: filter masuk ("dari peer ini saya
  hanya menerima alamat-alamat ini") **dan** routing keluar ("ke
  alamat-alamat ini, kirim lewat peer ini"). Lupa mencantumkan LAN lawan =
  terowongan hidup tapi hening — kesalahan WireGuard nomor satu.

**Di kantor cabang** (cermin, plus dua parameter khusus penginisiasi):

```
/interface/wireguard/add name=wireguard1 listen-port=13231
/ip/address/add address=172.16.0.2/30 interface=wireguard1
/interface/wireguard/peers/add interface=wireguard1 name=ke-pusat \
  public-key="PUBKEY_PUSAT_DI_SINI" endpoint-address=203.0.113.2 endpoint-port=13231 \
  allowed-address=172.16.0.1/32,192.0.2.0/24 persistent-keepalive=25s
```

- `endpoint-address=` — hanya sisi yang **memulai** yang perlu tahu alamat
  lawan; pusat cukup menunggu. Karena itu cabang ber-IP dinamis/di belakang
  [CGNAT](/networking/subnetting#alamat-khusus-yang-wajib-hafal) tetap bisa.
- `persistent-keepalive=25s` — denyut kecil agar pemetaan NAT di jalan tidak
  kedaluwarsa; wajib bagi sisi di belakang NAT.

**Rute + firewall di kedua sisi:**

```
/ip/route/add dst-address=198.51.100.0/24 gateway=wireguard1
/ip/firewall/filter/add chain=input protocol=udp dst-port=13231 action=accept \
  place-before=0 comment="WireGuard handshake"
```

- Gateway sebuah rute boleh berupa **nama interface** untuk link p2p.
- Tanpa lubang UDP 13231 di [firewall input](/mikrotik/firewall-qos#firewall-dasar-yang-layak-produksi),
  handshake mati di default deny — urutan aturan tetap raja.

Uji: `/ping 198.51.100.1 src-address=192.0.2.1` — memaksa paket masuk
terowongan dari sudut pandang LAN.

## IPsec dan L2TP/IPsec (peta singkat)

IPsec di RouterOS tersusun dari `peer` (dengan siapa), `identity`
(autentikasi), `proposal` (algoritme), dan `policy` (trafik mana yang
dilindungi) di bawah `/ip/ipsec`. Kombinasi tersering untuk *remote user*
tanpa aplikasi tambahan — L2TP dibungkus IPsec:

```
/interface/l2tp-server/server/set enabled=yes use-ipsec=required ipsec-secret=KunciBersama_Rahasia
/ppp/secret/add name=budi password=SandiBudi_77 service=l2tp local-address=172.16.1.1 \
  remote-address=172.16.1.10
```

- `use-ipsec=required` — L2TP polos tidak terenkripsi; opsi inilah yang
  membungkusnya dengan IPsec.
- `/ppp/secret` — akun per pengguna beserta IP yang akan ia terima di dalam
  terowongan.

::: warning PPTP: matikan bila masih ada
Enkripsinya (MPPE/MS-CHAPv2) sudah lama patah — memakai PPTP setara mengirim
[trafik telanjang](/networking/keamanan#tiga-pilar-cia) dengan perasaan aman
palsu: `/interface/pptp-server/server/set enabled=no`.
:::

## VPN di atas link satelit

Persilangan dua modul sebelumnya, dan jebakan favorit di lapangan:

- **Enkripsi membutakan PEP.** [Akselerator TCP](/satelit/komunikasi#dampak-latensi-pada-tcp)
  di modem VSAT tak bisa membaca header di dalam terowongan — koneksi TCP di
  dalam VPN merasakan [RTT GEO](/satelit/orbit#geo-geostationary-orbit) mentah
  ±600 ms. Ini fisika plus kriptografi; tak ada opsi ajaib yang membatalkannya.
- **Pilih UDP.** WireGuard/IKEv2 (UDP) menghindari bencana *TCP-over-TCP* —
  dua lapis [retransmisi](/networking/model-tcp-ip#tcp-andal-berurutan-kenal-kemacetan)
  yang saling memperparah di link ber-latensi tinggi.
- **Rapikan MSS.** Header terowongan memperkecil ruang muatan; paket yang
  menolak dipecah akan hilang senyap. Jepit MSS pada trafik yang melewati
  terowongan:

```
/ip/firewall/mangle/add chain=forward protocol=tcp tcp-flags=syn out-interface=wireguard1 \
  action=change-mss new-mss=1360 passthrough=yes comment="MSS clamp ke terowongan"
```

- Menyunting nilai MSS pada paket [SYN](/networking/model-tcp-ip#tcp-andal-berurutan-kenal-kemacetan)
  membuat kedua ujung sepakat memakai segmen yang muat di dalam terowongan —
  tiga puluh detik konfigurasi yang menyelamatkan berhari-hari debugging
  "web tertentu tidak bisa dibuka lewat VPN".

## Uji pemahaman

1. Terowongan WireGuard tersambung (handshake sukses) tapi LAN lawan tak
   ter-ping — tersangka pertama? → `allowed-address` tidak memuat subnet LAN
   lawan.
2. Kenapa hanya sisi cabang yang memakai `endpoint-address` dan
   `persistent-keepalive`? → Pusat ber-IP publik statis cukup pasif; cabang
   (IP dinamis/di belakang NAT) yang harus memulai dan menjaga lubang NAT.
3. Kapan EoIP masuk akal? → Saat dua situs harus berbagi
   [broadcast domain](/networking/switching#broadcast-domain-dan-masalah-skala)
   (aplikasi legacy, migrasi) — dibungkus VPN terenkripsi.

Tinggal satu bab: udara dan angkasa —
[Wireless & Satelit](/mikrotik/wireless-dan-satelit).
