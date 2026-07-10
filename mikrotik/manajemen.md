---
title: Manajemen Perangkat
---

# Manajemen Perangkat

Sebelum menyusun konfigurasi serius, kuasai dulu alat kerjanya: antarmuka mana
untuk pekerjaan apa, tata bahasa CLI, cara menyelamatkan diri dari kesalahan
sendiri (safe mode, backup), dan tata kelola user. Halaman ini adalah bekal
yang dipakai semua halaman berikutnya.

## WinBox vs WebFig vs CLI

| | WinBox | WebFig | CLI (SSH/terminal) |
| --- | --- | --- | --- |
| Bentuk | Aplikasi desktop | Browser | Teks |
| Akses tanpa IP | ✓ (mode MAC) | ✗ | ✓ (MAC-telnet) |
| Kecepatan kerja | Cepat untuk eksplorasi | Sedang | Tercepat jika hafal |
| Otomasi/dokumentasi | ✗ | ✗ | ✓ (skrip, copy-paste, export) |
| Kapan dipakai | Operasi harian | Darurat tanpa WinBox | Konfigurasi massal, catatan perubahan |

Ketiganya memandang **pohon menu yang sama** — jendela "IP → Addresses" di
WinBox identik dengan `/ip/address` di CLI. Modul ini memakai CLI karena bisa
disalin, diulang, dan dijelaskan per baris; setelah paham CLI, WinBox akan
terasa seperti versi klik-nya.

## Tata bahasa CLI

Semua menu memakai kata kerja yang sama:

```
/ip/address/add address=192.0.2.1/24 interface=ether2   ← tambah entri
/ip/address/print                                       ← lihat daftar
/ip/address/set 0 comment="LAN"                         ← ubah entri nomor 0
/ip/address/disable 0                                   ← nonaktifkan (X)
/ip/address/remove 0                                    ← hapus
```

- Angka `0` adalah **nomor urut hasil `print` terakhir** — bukan identitas
  permanen. Untuk skrip yang aman, cari berdasarkan properti:

```
/ip/address/set [find interface=ether2] comment="LAN"
```

- `[find ...]` — mengembalikan entri yang cocok kriteria; kebiasaan yang
  menyelamatkanmu dari salah nomor.

Pemercepat kerja yang wajib tahu:

- **Tab** — melengkapi perintah; dua kali Tab menampilkan pilihan.
- **`?`** — bantuan konteks di posisi mana pun.
- **`/export`** — cetak seluruh konfigurasi (atau `/ip/firewall/export` untuk
  satu cabang) sebagai skrip yang bisa dibaca dan dijalankan ulang.

::: tip Safe Mode: sabuk pengaman konfigurasi remote
Sebelum mengubah firewall/routing pada router yang jauh, tekan
**Ctrl+X** (safe mode) di terminal. Semua perubahan sesudahnya bersifat
sementara: jika koneksimu terputus — misalnya karena kamu memblokir dirimu
sendiri — **seluruh perubahan otomatis dibatalkan**. Tekan Ctrl+X lagi untuk
mengesahkan. Di WinBox tombolnya bertuliskan "Safe Mode" di kiri atas.
:::

## Backup & restore

Dua format, dua kegunaan — pakai **keduanya**:

| | `/system/backup` | `/export` |
| --- | --- | --- |
| Format | Biner (`.backup`) | Teks skrip (`.rsc`) |
| Isi | Semua, termasuk password & MAC | Konfigurasi (yang non-default) |
| Bisa dibaca/diedit | ✗ | ✓ |
| Cocok untuk | Pemulihan total ke perangkat yang sama | Migrasi antar-perangkat, audit, versioning |

```
/system/backup/save name=sebelum-upgrade password=RahasiaBackup!
/export file=konfig-2026-07-10
```

- `password=` — backup biner memuat kredensial; enkripsi bukan pilihan,
  melainkan keharusan.
- File muncul di `/file` — unduh keluar router (drag dari WinBox, atau
  `scp`). Backup yang hanya tersimpan di router yang sama dengan bencananya
  bukanlah backup.

Pulihkan dengan:

```
/system/backup/load name=sebelum-upgrade.backup password=RahasiaBackup!
/import file-name=konfig-2026-07-10.rsc
```

- `load` me-reboot dan mengembalikan kondisi persis; `import` mengeksekusi
  skrip baris demi baris di atas konfigurasi yang ada.

## Upgrade RouterOS

Versi baru = tambalan keamanan. Ritualnya dua tahap:

```
/system/package/update/check-for-updates
/system/package/update/install
```

- `install` mengunduh paket dan me-reboot. Setelah menyala kembali,
  samakan juga firmware bootloader-nya:

```
/system/routerboard/upgrade
```

- Firmware RouterBOOT terpasang saat reboot **berikutnya** — jadi total dua
  kali reboot untuk upgrade paripurna.

::: warning Sebelum menekan install
Backup dulu (dua format di atas), baca *changelog*, dan jangan lakukan dari
balik [link satelit](/satelit/vsat) tanpa rencana: reboot gagal di lokasi yang
butuh 6 jam perjalanan bukan pengalaman yang menyenangkan. Channel
`long-term` tersedia bagi yang mengutamakan stabilitas.
:::

## User dan grup

Kelola siapa boleh apa lewat `/user`:

```
/user/group/print
/user/add name=teknisi password=SandiTeknisi_99 group=read
/user/add name=noc password=SandiNOC_2026! group=write
```

- Grup bawaan: `full` (semua, termasuk kelola user), `write` (konfigurasi
  tapi tak bisa kelola user), `read` (hanya melihat — pas untuk monitoring).
- Grup kustom bisa dibuat dengan kombinasi *policy* (`ssh`, `winbox`,
  `sensitive`, `reboot`, …) — wujud *least privilege* dari
  [Zero Trust](/networking/keamanan#segmentasi-dan-zero-trust).

Jejak kerja setiap user terekam di `/log/print` — log juga hal pertama yang
dilihat saat troubleshooting.

## Uji pemahaman

1. Kamu akan mengubah firewall router di kota lain lewat SSH. Langkah pertama?
   → **Ctrl+X** (safe mode), sehingga salah blokir = otomatis batal.
2. Backup mana yang bisa dipakai memindahkan konfigurasi ke unit pengganti
   yang berbeda tipe? → `/export` (`.rsc`) — teks, bisa diedit menyesuaikan
   nama interface.
3. Kenapa `set 0` berbahaya di skrip? → Nomor urut berubah-ubah; gunakan
   `[find ...]`.

Alat sudah di tangan. Saatnya konfigurasi jaringan pertama:
[Interface & IP Address](/mikrotik/interface-ip).
