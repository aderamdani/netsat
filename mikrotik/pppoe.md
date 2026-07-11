---
title: PPPoE
---

# PPPoE

PPPoE (*Point-to-Point Protocol over Ethernet*) adalah protokol koneksi yang sangat umum di ISP Indonesia: pelanggan "login" dengan username dan password untuk mendapat akses internet. Halaman ini membahas sisi server (ISP) dan client (pelanggan).

## PPPoE server (ISP/pengelola jaringan)

Skenario: satu modem/perangkat terhubung ke router, router menjembatani banyak klien PPPoE.

### 1. Pool alamat untuk klien

```bash
/ip/pool/add name=pppoe-pool ranges=192.0.2.100-192.0.2.200
```

### 2. Profil koneksi

```bash
/ppp/profile/add name=pelanggan-10M local-address=192.0.2.1 remote-address=pppoe-pool rate-limit=10M/10M
```

- `local-address` — IP router sendiri untuk interface PPP
- `remote-address` — ambil dari pool
- `rate-limit=upload/download` — bandwidth maks per sesi

### 3. Akun pelanggan

```bash
/ppp/secret/add name=PLG001 password=Rahasia123 service=pppoe profile=pelanggan-10M comment="Jalan Merdeka No.5"
```

### 4. Interface PPPoE server

```bash
/interface/pppoe-server/server/add interface=bridge1 service-name=net-isp authentication=pap,chap
```

### 5. Cek sesi aktif

```bash
/interface/pppoe-server/print
/ppp/active/print
```

`/interface/pppoe-server/print` — status, uptime, user.
`/ppp/active/print` — semua sesi PPP aktif (PPPoE, L2TP, PPTP).

## PPPoE client (sisi pelanggan)

```bash
/interface/pppoe-client/add name=pppoe-wan interface=ether1 user=PLG001 password=Rahasia123
```

- DHCP client tidak dipakai — kredensial PPPoE yang memberi IP
- Satu baris: interface virtual `pppoe-wan` lahir dengan IP, gateway, DNS dari ISP
- Default route otomatis terpasang — tidak perlu `/ip/route/add`

Profil client bisa disetel agar reconnect otomatis saat putus:

```bash
/interface/pppoe-client/set pppoe-wan add-default-route=yes use-peer-dns=yes
```

## Manajemen bandwidth per akun

- Update profile tanpa putus: `/ppp/profile/set [find name=pelanggan-10M] rate-limit=20M/20M`
- Sesi berikutnya langsung kena; sesi aktif butuh reconnect
- Gunakan PPPoE + [Queue Tree](/mikrotik/firewall-qos#queue-tree-pcq-sekilas) untuk QoS hierarkis
- Alternatif: `rate-limit` di profile saja untuk 90% kasus

## Firewall untuk PPPoE

- PPPoE Discovery (PADI/PADO/PADR/PADS) via ethernet broadcast — tidak butuh aturan khusus
- Setelah koneksi naik, semua trafik klien lewat interface PPP — aturan firewall merujuk ke `in-interface=pppoe-...` atau `in-interface-list`

Contoh: blokir akses antar-pelanggan (isolasi):

```bash
/ip/firewall/filter/add chain=forward in-interface=pppoe-pppoe-wan out-interface=pppoe-pppoe-wan action=drop
```

## Uji pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Pelanggan terkoneksi (status `connected`) tapi tidak bisa membuka situs web — apa yang pertama diperiksa? → Firewall `forward`: pastikan ada aturan `accept` dari `in-interface=pppoe-...` ke WAN atau aturan `established,related` di posisi pertama.
2. Kenapa sesi PPPoE client tidak perlu `/ip/dhcp-client`? → IP dan gateway diberikan langsung oleh server PPPoE melalui mekanisme PPP (IPCP), bukan DHCP.
3. Bedakan `local-address` dan `remote-address` di profile. → `local-address` adalah IP router untuk ujung terowongan; `remote-address` bisa berupa pool — alamat yang diberikan ke klien.

</details>