---
title: Praktik Integrasi RouterOS
---

# Praktik Integrasi RouterOS

Mengintegrasikan terminal Starlink dengan MikroTik RouterOS memberikan kendali penuh kepada administrator jaringan untuk mengelola distribusi alamat IP, keamanan firewall, dan manajemen bandwidth di lingkungan lokal.

Halaman ini berisi panduan konfigurasi copy-paste praktis menggunakan RouterOS v7 untuk mengoptimalkan link Starlink.

---

## 1. Konfigurasi Awal & Bypass Mode

Sebelum menghubungkan kabel fisik, matikan fungsi routing pada router bawaan Starlink:
1.  Buka aplikasi Starlink di ponsel Anda.
2.  Masuk ke **Settings** → Pilih **Bypass Starlink Router**.
3.  Hubungkan kabel ethernet dari Starlink (melalui Ethernet Adapter atau port langsung Gen 3) ke port **ether1** MikroTik (kita asumsikan `ether1` adalah port WAN).

### Konfigurasi IPv4 DHCP Client di RouterOS
Minta alamat IP dari terminal Starlink secara otomatis:

```routeros
/ip dhcp-client add interface=ether1 disabled=no use-peer-dns=yes use-peer-ntp=yes
```

Periksa apakah RouterOS mendapatkan IP kelas `100.64.0.0/10` (CGNAT) pada paket Residensial, atau IP Publik Dinamis pada paket Enterprise melalui menu `/ip/dhcp-client/print`.

---

## 2. Rute Statis Akses Telemetri Aplikasi Starlink

Meskipun dalam mode bypass, antena Starlink memiliki IP internal **`192.168.100.1`** yang memancarkan telemetri (latensi, hambatan, dll.) ke aplikasi Starlink di HP client.

Tambahkan rute statis agar client di jaringan LAN MikroTik tetap dapat membuka aplikasi Starlink:

```routeros
/ip route add dst-address=192.168.100.1/32 gateway=ether1 distance=1 comment="Akses Aplikasi Starlink"
```

---

## 3. Konfigurasi IPv6 Prefix Delegation

Starlink mendukung IPv6 secara native. Kita dapat menggunakan metode **DHCPv6 Prefix Delegation (PD)** agar semua client di LAN otomatis mendapatkan IP global IPv6 asli tanpa NAT.

### Langkah 1: Minta Prefiks dari Starlink
Minta prefiks IPv6 dan simpan ke pool bernama `starlink-v6-pool`:

```routeros
/ipv6 dhcp-client add interface=ether1 pool-name=starlink-v6-pool request=prefix prefix-hint=::/56 disabled=no
```

### Langkah 2: Distribusikan ke Interface LAN (SLAAC)
Pasang alamat IPv6 dari pool tersebut ke interface LAN (misal: `bridge1`) dan aktifkan iklan IP (*Router Advertisement*):

```routeros
/ipv6 address add address=::1/64 from-pool=starlink-v6-pool interface=bridge1 advertise=yes
```

Dengan `advertise=yes`, client LAN akan otomatis membuat IP global IPv6 mereka sendiri secara dinamis menggunakan protokol SLAAC.

---

## 4. Workaround CGNAT (Port Forwarding via WireGuard)

Karena paket residensial menggunakan CGNAT, port forwarding IPv4 langsung di MikroTik tidak akan bekerja. Solusi praktisnya adalah melakukan koneksi keluar (tunneling) menuju VPS eksternal ber-IP Publik:

```text
 [ Client di Internet ] ──► [ VPS IP Publik: 203.0.113.5 ]
                                      │
                         === WIREGUARD TUNNEL === (Keluar menembus CGNAT)
                                      │
                                      ▼
                                 [ RouterOS ] (WAN IP: 100.64.x.x)
                                      │
                                      ▼
                              [ Web Server LAN ]
```

### Konfigurasi WireGuard di RouterOS:

```routeros
# 1. Buat interface WireGuard
/interface wireguard add name=wg-cgnat-bypass listen-port=13231

# 2. Tambahkan alamat IP WireGuard yang diberikan oleh VPS (misal: 10.0.0.2/24)
/ip address add address=10.0.0.2/24 interface=wg-cgnat-bypass

# 3. Hubungkan Peer ke VPS Publik
/interface wireguard peers add interface=wg-cgnat-bypass \
  public-key="MASUKKAN_PUBLIC_KEY_VPS_ANDA=" \
  endpoint-address=203.0.113.5 endpoint-port=51820 \
  allowed-address=0.0.0.0/0 persistent-keepalive=25s
```

*   `persistent-keepalive=25s`: Sangat penting untuk mengirimkan paket *keepalive* setiap 25 detik agar tabel translasi NAT di ISP Starlink tidak menghapus jalur koneksi keluar kita.

---

## 5. Mengatasi Bandwidth Fluktuatif menggunakan QoS CAKE

Satelit LEO memiliki kapasitas bandwidth yang berubah-ubah secara konstan. Membatasi bandwidth dengan antrean statis kaku di satelit LEO akan memicu *bufferbloat* saat sinyal melemah. 

Gunakan algoritma **CAKE** pada RouterOS v7 untuk menyeimbangkan bandwidth antar pengguna secara dinamis:

```routeros
# 1. Buat tipe antrean CAKE untuk upload (TX) dan download (RX)
/queue type
add name=starlink-cake-tx kind=cake cake-flowmode=triple-isolate cake-nat=yes
add name=starlink-cake-rx kind=cake cake-flowmode=triple-isolate cake-nat=yes

# 2. Pasang Simple Queue menggunakan tipe antrean CAKE
/queue simple
add name=starlink-cake-qos target=192.168.88.0/24 \
  queue=starlink-cake-tx/starlink-cake-rx comment="QoS Dinamis Starlink (CAKE)"
```

*   `cake-flowmode=triple-isolate`: Memilah bandwidth secara adil berdasarkan host pengirim, penerima, dan jenis aplikasi. Ini mencegah satu komputer client yang sedang melakukan download besar/torrent memonopoli seluruh bandwidth Starlink.

---

## Cek Pemahaman

1.  Mengapa parameter `persistent-keepalive=25s` sangat penting disetel pada konfigurasi WireGuard untuk menembus CGNAT Starlink?
    <br>→ Karena router di dalam jaringan CGNAT Starlink akan menutup sesi port translasi NAT jika tidak ada aktivitas dalam waktu tertentu. Mengirimkan paket kosong setiap 25 detik memastikan terowongan VPN tetap terbuka dari luar.
2.  Apa keunggulan penggunaan QoS CAKE dibanding Simple Queue tradisional dengan nilai *limit-at* dan *max-limit* statis pada link satelit LEO?
    <br>→ QoS CAKE membagi bandwidth secara dinamis dan adil (*fair-queueing*) berdasarkan host dan aplikasi tanpa perlu mendefinisikan batas bandwidth maksimum yang kaku. Hal ini sangat cocok untuk Starlink yang bandwidth-nya fluktuatif naik-turun.
3.  Apakah setelah mengaktifkan *Bypass Mode* kita masih bisa melakukan manajemen bandwidth dan firewall di RouterOS?
    <br>→ Ya, justru karena RouterOS memegang IP WAN langsung, RouterOS memiliki kontrol penuh 100% untuk melakukan manajemen bandwidth, firewall filtering, NAT, dan routing untuk seluruh client LAN.
