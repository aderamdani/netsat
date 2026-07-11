---
title: IPv6 di RouterOS
---

# IPv6 di RouterOS

Meskipun [teori IPv6](/networking/subnetting#deep-dive-ipv6-subnetting) menawarkan miliaran alamat tanpa NAT, ia tidak akan berjalan jika tidak diaktifkan dan dikonfigurasi di router Anda. Halaman ini menjelaskan cara menerapkan IPv6 pada RouterOS v7 — mulai dari menerima delegasi prefix ISP hingga mengamankannya dengan firewall.

---

## 1. Memeriksa Status Paket IPv6

Pada RouterOS v7, dukungan IPv6 sudah terpasang secara bawaan (*built-in*) di dalam sistem. Namun, Anda tetap dapat menonaktifkan atau mengaktifkannya melalui menu `/ipv6/settings`:

```bash
/ipv6/settings/set disable-ipv6=no
```
*(Catatan: Jika Anda mengubah pengaturan ini, router harus di-reboot agar konfigurasi aktif).*

Verifikasi apakah IPv6 aktif dengan melihat interface lokal Anda:
```bash
/ipv6/address/print
```
Jika Anda melihat alamat ber-prefix `fe80::` (Link-Local Address), berarti modul IPv6 telah berjalan normal pada interface tersebut.

---

## 2. Mengambil Prefix dari ISP (DHCPv6 Client)

Di dunia IPv4, pelanggan biasanya mendapatkan **satu** IP Publik untuk interface WAN, lalu menggunakan NAT untuk LAN. Di IPv6, ISP akan mendelegasikan **satu blok utuh** (biasanya `/56` atau `/64`) agar router Anda bisa mendistribusikannya ke client LAN tanpa NAT. Fitur ini disebut **DHCPv6 Prefix Delegation (PD)**.

```
       [ISP IPv6 Gateway]
               │ (Delegasikan blok 2001:db8:cafe::/56 via DHCPv6-PD)
               ▼
        [ether1 - WAN] (Menerima prefix & menyimpannya di pool: pool-ipv6)
          [RouterOS]
        [bridge1 - LAN] (Mengambil prefix /64 dari pool-ipv6 & mengiklankannya)
               │ (SLAAC / ND)
               ▼
         [Client LAN] (Mengonfigurasi IP otomatis: 2001:db8:cafe:1::abc)
```

### Konfigurasi DHCPv6-PD Client:
```bash
/ipv6/dhcp-client/add interface=ether1 request=prefix pool-name=pool-ipv6 pool-prefix-length=64 \
    add-default-route=yes comment="Minta prefix IPv6 dari ISP"
```

*   `interface=ether1`: Interface yang terhubung ke modem ISP.
*   `request=prefix`: Menegaskan bahwa kita meminta alokasi blok prefix, bukan hanya IP tunggal.
*   `pool-name=pool-ipv6`: Nama kontainer penyimpanan prefix yang diterima agar bisa digunakan interface LAN.
*   `pool-prefix-length=64`: RouterOS akan memecah blok yang diterima (misalnya `/56`) menjadi subnet `/64` untuk didistribusikan ke interface lokal.

Verifikasi status penerimaan:
```bash
/ipv6/dhcp-client/print
# Cari kolom "status", pastikan bertuliskan "bound" dan menampilkan prefix yang diperoleh.
```

---

## 3. Distribusi Alamat ke LAN (SLAAC & ND)

Setelah prefix tersimpan di `pool-ipv6`, kita pasang alamat IPv6 pada interface LAN (`bridge1`) dengan mengambil prefix secara dinamis dari pool tersebut.

```bash
/ipv6/address/add interface=bridge1 address=::1/64 from-pool=pool-ipv6 advertise=yes
```

*   `address=::1/64`: Router akan menggunakan IP `::1` (host pertama di subnet) pada interface `bridge1`.
*   `from-pool=pool-ipv6`: Menginstruksikan router untuk mengisi bagian prefix kosong (`::`) di depan `::1` menggunakan alokasi pool yang didapatkan dari ISP secara otomatis.
*   `advertise=yes`: Router akan mengiklankan (*advertise*) prefix `/64` ini ke jaringan LAN menggunakan pesan **ICMPv6 Router Advertisement (RA)**.

### Mengatur Neighbor Discovery (ND) untuk Client:
Secara default, RouterOS telah mengaktifkan layanan **ND (Neighbor Discovery)** di semua interface. Klien di LAN (Windows/Linux/Android) yang mendengarkan RA akan otomatis mengonfigurasi IP mereka sendiri menggunakan metode **SLAAC**:

```bash
/ipv6/nd/set [find default=yes] advertise-dns=yes managed-address-configuration=no \
    other-configuration=no
```

*   `advertise-dns=yes`: Router akan menyertakan IP DNS IPv6-nya ke klien dalam pesan RA.
*   `managed-address-configuration=no`: Kita menggunakan SLAAC murni, bukan DHCPv6 Stateful.

---

## 4. Keamanan Dasar: Firewall IPv6

Karena tidak ada NAT di IPv6, **setiap perangkat di LAN Anda memiliki IP Publik yang dapat diakses langsung dari seluruh internet**. Tanpa adanya firewall yang kuat, port komputer internal Anda (seperti RDP, SMB, HTTP) akan terbuka bebas ke luar.

Firewall IPv6 RouterOS dikonfigurasi pada menu `/ipv6/firewall`. Berikut adalah aturan keamanan dasar (*stateful firewall*) yang wajib dipasang:

```bash
/ipv6/firewall/filter
# 4.1. Izinkan koneksi yang sudah terjalin (Established, Related)
add chain=input connection-state=established,related action=accept
add chain=forward connection-state=established,related action=accept

# 4.2. Izinkan ICMPv6 (PENTING: IPv6 tidak akan bekerja tanpa ICMPv6 untuk ND & PMTUD)
add chain=input protocol=icmpv6 action=accept
add chain=forward protocol=icmpv6 action=accept

# 4.3. Izinkan DHCPv6 Client inbound (untuk komunikasi router ke ISP)
add chain=input protocol=udp dst-port=546 action=accept

# 4.4. Blokir semua koneksi baru (New, Invalid) dari internet menuju router
add chain=input connection-state=invalid action=drop
add chain=input in-interface=ether1 connection-state=new action=drop comment="Blokir akses masuk luar ke router"

# 4.5. Blokir koneksi dari internet menuju ke jaringan LAN
add chain=forward connection-state=invalid action=drop
add chain=forward in-interface=ether1 connection-state=new action=drop comment="Blokir akses masuk luar ke LAN"
```

> [!IMPORTANT]
> Jangan pernah memblokir protokol `icmpv6` secara total pada firewall IPv6 Anda. Berbeda dengan IPv4 di mana ICMP ping dapat diblokir tanpa efek samping, ICMPv6 adalah pondasi operasional IPv6 yang mengurusi Neighbor Discovery (pencarian MAC Address) dan Path MTU Discovery (fragmentasi paket). Memblokirnya akan memutus total jaringan IPv6 Anda.

---

## Uji pemahaman

<details>
<summary>Lihat jawaban</summary>


1. **Kenapa kita tidak perlu melakukan konfigurasi NAT (masquerade) pada IPv6?**
   <br>→ Karena setiap perangkat LAN mendapatkan alokasi IP Global Unicast (GUA) unik langsung dari pool ISP, sehingga paket dapat dikirim bolak-balik di internet secara langsung. Peran keamanan NAT digantikan sepenuhnya oleh firewall filter.

2. **Apa yang terjadi jika parameter `advertise` di `/ipv6/address` diset ke `no`?**
   <br>→ Router tidak akan mengiklankan prefix ke LAN. Akibatnya, klien lokal tidak akan mendapatkan IP IPv6 otomatis (SLAAC) dan konektivitas IPv6 di LAN akan mati.

3. **Mengapa aturan firewall ICMPv6 wajib di-accept?**
   <br>→ ICMPv6 menggantikan peran ARP (melalui Neighbor Solicitation/Advertisement) dan menangani penyesuaian ukuran paket (MTU). Memblokirnya akan menghentikan komunikasi lokal maupun internet IPv6.

</details>