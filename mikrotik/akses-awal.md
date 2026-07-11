---
title: Akses Awal
---

# Akses Awal

Kotak baru tiba. Sebelum satu paket pun dirutekan, kamu harus bisa **masuk** —
dan langkah-langkah pertama inilah yang menentukan apakah router itu kelak jadi
benteng atau pintu belakang. Halaman ini mengikuti alur *Getting Started* di
manual resmi: menjangkau perangkat, memahami konfigurasi bawaan, reset, dan
mengamankan akses sejak menit pertama.

## Lima pintu masuk

| Metode | Jalur | Butuh IP? | Kapan dipakai |
| --- | --- | --- | --- |
| **WinBox** | TCP 8291 | Tidak (bisa via MAC) | Alat utama sehari-hari (GUI) |
| **WebFig** | HTTP/HTTPS 80/443 | Ya | Dari browser, tanpa instal apa pun |
| **SSH** | TCP 22 | Ya | Otomasi, akses remote aman |
| **MAC-telnet** | Layer 2 (MAC) | **Tidak** | Penyelamat saat IP kacau |
| **Konsol serial** | Kabel serial/RJ45 | Tidak | Jalan terakhir, perangkat tertentu |

::: info Kenapa MAC-telnet bisa jalan tanpa IP?
MAC-telnet (dan mode MAC di WinBox) berbicara langsung di
[layer 2](/networking/model-osi#layer-2-—-data-link) memakai alamat MAC —
tidak butuh alamat IP sama sekali. Syaratnya persis sifat layer 2: kamu harus
berada di **broadcast domain yang sama** (tersambung langsung/lewat switch,
tanpa melewati router). Salah subnet, salah ketik IP, DHCP mati — MAC-telnet
tetap bisa masuk. Teorinya ada di [Switching](/networking/switching#alamat-mac).
:::

## Konfigurasi bawaan (default configuration)

Kebanyakan RouterBOARD rumahan/kantor keluar pabrik dengan pola yang sama:

| Komponen | Nilai bawaan |
| --- | --- |
| `ether1` | WAN — DHCP client aktif (minta IP ke modem/ISP) |
| `ether2`–`etherN` | LAN — digabung dalam satu bridge |
| IP router | `192.168.88.1/24` di bridge LAN |
| DHCP server | Membagikan `192.168.88.10–254` ke LAN |
| NAT | Masquerade LAN → WAN |
| Firewall dasar | Blokir akses masuk dari WAN |
| User | `admin` (password kosong, atau tercetak di stiker perangkat pada unit keluaran baru) |

Artinya: colok laptop ke `ether2`, dapat IP otomatis, buka WinBox ke
`192.168.88.1`, masuk sebagai `admin` — dan internet biasanya langsung jalan.
Konfigurasi bawaan ini bisa dilihat (dan dibaca sebagai bahan belajar!) dengan:

```bash
/system/default-configuration/print
```

### Ritual pertama di WinBox

Buka WinBox → tab **Neighbors**: semua perangkat MikroTik di segmen layer 2
muncul otomatis (hasil *neighbor discovery*). Di sinilah dua mode masuk
terlihat jelas:

- Klik kolom **IP** → masuk via layer 3 (normal).
- Klik kolom **MAC Address** → masuk via layer 2 — tetap bekerja walau IP
  router kacau balau. Ini WinBox mode MAC yang disebut tabel di atas.

Kebiasaan baik yang murah: begitu berhasil masuk, beri nama kotaknya —
`/system/identity/set name=rtr-kantor-01` — supaya tab Neighbors (dan log,
dan prompt CLI) tidak dipenuhi selusin perangkat bernama "MikroTik".

## Reset: kembali ke titik nol

Dua cara, satu tujuan:

**Tombol reset fisik** — tahan tombol *reset* sambil mencolok power, lepaskan
saat LED mulai berkedip (±5 detik): konfigurasi kembali ke bawaan. (Menahan
lebih lama lagi masuk mode Netinstall untuk instal ulang total.)

**Lewat perintah:**

```bash
/system/reset-configuration no-defaults=yes skip-backup=yes
```

- `/system/reset-configuration` — hapus seluruh konfigurasi lalu reboot.
- `no-defaults=yes` — jangan pasang konfigurasi bawaan; router bangun
  benar-benar kosong (pilihan favorit untuk belajar dan untuk konfigurasi
  produksi yang dibangun dari nol).
- `skip-backup=yes` — jangan buat backup otomatis sebelum reset.

::: warning Router kosong = tanpa IP sama sekali
Setelah `no-defaults=yes`, tidak ada IP, tidak ada DHCP. Satu-satunya jalan
masuk adalah **MAC-telnet/WinBox via MAC** — persis alasan metode layer 2 itu
wajib kamu kuasai sebelum bermain reset.
:::

## Mengamankan akses sejak menit pertama

Router yang baru menyala adalah target: pemindai internet menemukan perangkat
dengan password bawaan dalam hitungan menit. Urutan pengamanan minimum —
selaras dengan halaman [Keamanan Jaringan](/networking/keamanan#kebersihan-dasar-baseline):

**1. Ganti identitas admin.** Buat user baru dengan nama tak tertebak, lalu
hapus `admin`:

```bash
/user/add name=ns-admin password=KataSandi_Panjang_123! group=full
/user/remove admin
```

- `group=full` — hak penuh; grup lain (`read`, `write`) dibahas di
  [Manajemen Perangkat](/mikrotik/manajemen#user-dan-grup).
- Menghapus `admin` mematikan separuh serangan brute-force: penyerang harus
  menebak nama *dan* kata sandinya.

**2. Matikan layanan yang tidak dipakai** dan batasi sisanya ke subnet
manajemen:

```bash
/ip/service/set telnet disabled=yes
/ip/service/set ftp disabled=yes
/ip/service/set www disabled=yes
/ip/service/set api disabled=yes
/ip/service/set winbox address=192.0.2.0/24
/ip/service/set ssh address=192.0.2.0/24
```

- `telnet`/`ftp` — protokol tanpa enkripsi; tidak ada alasan menyalakannya.
- `address=192.0.2.0/24` — layanan hanya menjawab dari subnet ini
  (*allowlist*, wujud nyata prinsip
  [default deny](/networking/keamanan#firewall)).

**3. Matikan akses layer 2 di jaringan produksi.** MAC-telnet praktis saat
instalasi, berbahaya jika dibiarkan — siapa pun di broadcast domain bisa
mencoba masuk:

```bash
/tool/mac-server/set allowed-interface-list=none
/tool/mac-server/mac-winbox/set allowed-interface-list=none
/ip/neighbor/discovery-settings/set discover-interface-list=none
```

- Tiga baris ini menutup MAC-telnet, MAC-WinBox, dan *neighbor discovery*
  (siaran identitas router ke tetangga) di semua interface — rekomendasi
  eksplisit halaman *Securing your router* di manual resmi.

**4. Perbarui RouterOS** sebelum perangkat melayani trafik sungguhan — cara
lengkapnya di [Manajemen Perangkat](/mikrotik/manajemen#upgrade-routeros).

### Checklist menit-menit pertama

Rangkuman yang layak ditempel di dinding — urutan untuk **setiap** kotak baru:

| ✓ | Langkah | Perintah kunci |
| --- | --- | --- |
| 1 | Masuk, beri identitas | `/system/identity/set name=...` |
| 2 | User baru, hapus `admin` | `/user/add ...` → `/user/remove admin` |
| 3 | Matikan layanan tak terpakai | `/ip/service/set ... disabled=yes` |
| 4 | Batasi WinBox/SSH ke subnet manajemen | `/ip/service/set ... address=...` |
| 5 | Tutup MAC-server & discovery | `/tool/mac-server/set ...` |
| 6 | Upgrade RouterOS + firmware | `/system/package/update/install` |
| 7 | Backup kondisi bersih | `/system/backup/save` + `/export` |

Tujuh baris, lima menit — dan routermu sudah lebih aman daripada mayoritas
perangkat yang tersambung ke internet hari ini.

## Uji pemahaman

1. Router habis di-reset `no-defaults=yes` — bagaimana masuk lagi?
   → **MAC-telnet / WinBox mode MAC** dari laptop di segmen L2 yang sama.
2. Kenapa MAC-telnet tidak bisa dipakai dari kantor pusat ke router cabang?
   → Ia bekerja di layer 2; antar-kota berarti melewati router, dan
   [router memutus broadcast domain](/networking/switching#broadcast-domain-dan-masalah-skala).
3. Dua langkah yang mematahkan brute-force login paling murah? → Hapus user
   `admin` + batasi `winbox/ssh` dengan `address=` subnet manajemen.

Sudah bisa masuk dengan aman — sekarang kenali alat-alat kerjanya:
[Manajemen Perangkat](/mikrotik/manajemen).
