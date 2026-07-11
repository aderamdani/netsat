---
title: Interface & IP Address
---

# Interface & IP Address

Di sinilah teori [IP Addressing & Subnetting](/networking/subnetting) menyentuh
kenyataan: alamat, prefix, network, dan broadcast yang dulu dihitung di kertas
kini dipasangkan ke port sungguhan.

## Mengenal interface

Semua pintu keluar-masuk paket adalah *interface* — fisik maupun logis:

| Jenis | Contoh nama | Apa itu |
| --- | --- | --- |
| Ethernet | `ether1`…`etherN` | Port fisik RJ45/SFP |
| Bridge | `bridge1` | Switch virtual — gabungan beberapa port ([bab berikutnya](/mikrotik/bridging-switching)) |
| VLAN | `vlan10` | Sub-interface [802.1Q](/networking/switching#trunk-dan-tagging-802-1q) di atas interface lain |
| WiFi | `wifi1` | Radio nirkabel ([bab Wireless](/mikrotik/wireless-dan-satelit)) |
| WireGuard/EoIP/GRE | `wireguard1` | Terowongan [VPN](/mikrotik/vpn) |
| Loopback | `lo` | Alamat internal router — stabil untuk manajemen & BGP |

```
/interface/print
```

Bacaan pentingnya ada di kolom bendera: `R` = *running* (link hidup),
`X` = *disabled*, `S` = *slave* (milik bridge/bonding — lihat bab berikutnya).
Beri nama yang bermakna sejak awal:

```
/interface/ethernet/set ether1 comment="WAN - ke modem ISP"
/interface/ethernet/set ether2 comment="LAN - switch kantor"
```

## Memasang alamat IP

Perintah inti seluruh halaman ini:

```
/ip/address/add address=192.0.2.1/24 interface=ether2 comment="Gateway LAN"
```

- `address=192.0.2.1/24` — alamat **wajib beserta prefix**. Dari `/24`,
  RouterOS otomatis menurunkan `network=192.0.2.0` — kamu tidak mengetik
  subnet mask `255.255.255.0` sama sekali; notasi
  [CIDR](/networking/subnetting#notasi-cidr-dan-subnet-mask) adalah bahasa aslinya.
- `interface=ether2` — di RouterOS, alamat milik **interface**, bukan milik
  perangkat. Satu interface boleh punya banyak alamat; satu alamat tak boleh
  di dua interface.

Periksa hasilnya:

```
/ip/address/print
# Flags: D - dynamic
#  #   ADDRESS            NETWORK         INTERFACE
#  0   192.0.2.1/24       192.0.2.0       ether2
#  1 D 203.0.113.27/24    203.0.113.0     ether1
```

- Bendera `D` (*dynamic*) = alamat pemberian [DHCP client](/mikrotik/dhcp-dns-nat#dhcp-client-sisi-wan)
  di WAN — tidak bisa di-edit manual karena bukan kamu yang memasangnya.

::: tip Uji pemahaman subnetting-mu di sini
Pasang `192.0.2.200/26` di sebuah interface, lalu `print`: RouterOS menulis
network `192.0.2.192`. Cocokkan dengan
[resep hitung cepat](/networking/subnetting#resep-hitung-cepat) — block size
64, kelipatan di bawah 200 adalah 192. Router adalah kalkulator subnetting
yang jujur.
:::

## Alamat kedua dan pola-pola umum

Interface boleh memikul beberapa subnet sekaligus — berguna saat migrasi
penomoran:

```
/ip/address/add address=192.0.2.1/24 interface=ether2
/ip/address/add address=198.51.100.1/24 interface=ether2 comment="migrasi lama"
```

Dan untuk link antar-router yang hanya butuh 2 alamat, gunakan `/30` persis
seperti [teorinya](/networking/subnetting#subnetting-membagi-satu-blok-menjadi-beberapa):

```
/ip/address/add address=198.51.100.1/30 interface=ether5 comment="p2p ke router-B"
```

## ARP: melihat tetangga layer 2

Tabel penerjemah [IP ↔ MAC](/networking/switching#arp-jembatan-antara-ip-dan-mac)
bisa diintip langsung:

```
/ip/arp/print
#  #    ADDRESS        MAC-ADDRESS        INTERFACE
#  0 DC 192.0.2.10     4C:5E:0C:11:22:33  ether2
```

- `D` = dinamis (hasil ARP normal), `C` = *complete*. Entri statis
  (`/ip/arp/add`) dipakai jaringan paranoid yang mengunci pasangan IP–MAC —
  salah satu obat [ARP spoofing](/networking/keamanan#serangan-yang-wajib-dipahami-cara-kerjanya).

## Diagnosis dari dalam router

Router adalah titik pandang terbaik untuk troubleshooting
[per lapisan](/networking/model-osi#berpikir-per-lapisan-saat-troubleshooting):

```
/interface/monitor-traffic ether1 once     # L1/L2: link & laju bit
/ping 192.0.2.10 count=4                   # L3: keterjangkauan host LAN
/ping 203.0.113.1 src-address=192.0.2.1    # L3: uji dari alamat tertentu
/tool/traceroute 198.51.100.10             # L3: jalur hop demi hop
/tool/sniffer/quick interface=ether2       # lihat paket telanjang (mini-Wireshark)
```

- `src-address=` pada ping — menguji kebijakan/NAT dari sudut pandang klien,
  bukan dari router; sering mengungkap masalah yang "ping dari router jalan,
  dari klien tidak".

## Uji pemahaman

<details>
<summary>Lihat jawaban</summary>


1. `add address=192.0.2.1 interface=ether2` (tanpa `/24`) — apa akibatnya?
   → RouterOS menganggap `/32`; klien LAN takkan menemukan gateway-nya.
   Prefix bukan hiasan.
2. Alamat ber-bendera `D` dari mana? → Dinamis — DHCP client, PPP, dsb;
   dikelola prosesnya, bukan oleh `/ip/address`.
3. Link p2p antar-router paling hemat memakai prefix apa? →
   [`/30`](/networking/subnetting#vlsm-subnet-dengan-ukuran-berbeda-beda)
   (atau `/31`).

Satu port satu kabel sudah beres. Menggabungkan banyak port menjadi switch —
lengkap dengan VLAN — adalah bab berikutnya:
[Bridging & Switching](/mikrotik/bridging-switching).

</details>