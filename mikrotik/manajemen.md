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

```bash
/ip/address/add address=192.0.2.1/24 interface=ether2   ← tambah entri
/ip/address/print                                       ← lihat daftar
/ip/address/set 0 comment="LAN"                         ← ubah entri nomor 0
/ip/address/disable 0                                   ← nonaktifkan (X)
/ip/address/remove 0                                    ← hapus
```

- Angka `0` adalah **nomor urut hasil `print` terakhir** — bukan identitas
  permanen. Untuk skrip yang aman, cari berdasarkan properti:

```bash
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

```bash
/system/backup/save name=sebelum-upgrade password=RahasiaBackup!
/export file=konfig-2026-07-10
```

- `password=` — backup biner memuat kredensial; enkripsi bukan pilihan,
  melainkan keharusan.
- File muncul di `/file` — unduh keluar router (drag dari WinBox, atau
  `scp`). Backup yang hanya tersimpan di router yang sama dengan bencananya
  bukanlah backup.

Pulihkan dengan:

```bash
/system/backup/load name=sebelum-upgrade.backup password=RahasiaBackup!
/import file-name=konfig-2026-07-10.rsc
```

- `load` me-reboot dan mengembalikan kondisi persis; `import` mengeksekusi
  skrip baris demi baris di atas konfigurasi yang ada.

## Upgrade RouterOS

Versi baru = tambalan keamanan. Ritualnya dua tahap:

```bash
/system/package/update/check-for-updates
/system/package/update/install
```

- `install` mengunduh paket dan me-reboot. Setelah menyala kembali,
  samakan juga firmware bootloader-nya:

```bash
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

```bash
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

## NTP: jam yang akurat

Waktu yang akurat bukan sekadar kenyamanan — ini kebutuhan keamanan. Sertifikat
VPN, log serangan, dan debugging semuanya bergantung pada *timestamp* yang
benar. Router dengan jam meleset akan menolak sertifikat yang sudah valid atau
mencatat insiden di waktu yang salah.

```bash
/system/ntp/client/set enabled=yes servers=0.id.pool.ntp.org,1.id.pool.ntp.org
```

Pastikan sinkronisasi berjalan:

```bash
/system/ntp/client/print
```

Perhatikan kolom `status` — seharusnya `synchronized`. Jika tetap `error`,
periksa apakah UDP/123 diizinkan keluar di firewall.

Router juga bisa menjadi sumber waktu (NTP server) untuk perangkat di LAN:

```bash
/system/ntp/server/set enabled=yes broadcast=yes
```

::: warning Firewall untuk NTP
- **Client**: izinkan `udp/123` ke **luar** — hanya dari router sendiri,
  bukan dari LAN (kecuali LAN juga perlu NTP lewat router).
- **Server**: batasi `udp/123` masuk hanya dari subnet LAN, jangan dari
  internet — atau siap-siap menjadi korban *amplifikasi DDoS*.
:::

## Sistem logging

RouterOS mencatat peristiwa dalam *topik* berjenjang: `info`, `warning`,
`error`, `critical`. Semakin parah tingkatannya, semakin penting untuk dicek.

Lihat 100 entri terakhir:

```bash
/log/print
```

Kirim log ke server pusat (syslog remote) jika jaringanmu punya SIEM atau
Log Management:

```bash
/system/logging/action/add name=syslog-remote type=remote remote=192.0.2.100
/system/logging/add topics=info,error action=syslog-remote
```

Sebagian topik bisa tetap disimpan di memori untuk akses cepat:

```bash
/system/logging/add topics=firewall,info action=memory
```

Topik yang paling sering dipantau: `firewall` (blokade), `dhcp`, `system`,
`critical` (segala yang darurat).

::: tip Rotasi log otomatis
Buffer memory terbatas — entri lama akan tertimpa. Jika perlu jejak panjang,
arahkan topik penting ke remote syslog atau simpan ke file dengan action
`disk`.
:::

## Manajemen file

Semua file — backup, ekspor konfigurasi, paket upgrade, log — berada di
satu tempat:

```bash
/file/print
```

Hapus file yang tidak perlu (misal backup lama sebelum rilis baru):

```bash
/file/remove nama-file.backup
```

Cara memasukkan atau mengeluarkan file:

| Metode | Cara |
| --- | --- |
| **WinBox** | Drag & drop di jendela Files |
| **SCP** | `scp konfig.rsc admin@192.0.2.1:` |
| **/tool/fetch** | Unduh dari URL: `/tool/fetch url=http://...` |
| **Export** | `/export file=namafile` — langsung dari CLI |

File yang biasa ditemui di router:

- `*.backup` — backup biner (kredensial terenkripsi dengan password)
- `*.rsc` — *export* konfigurasi teks (aman dibaca/diedit sebelum
  `import`)
- `*.npk` — paket upgrade RouterOS (letakkan di `/file`, lalu reboot)
- `flash/` dan `disk/` — partisi penyimpanan; cek kapasitas dengan
  `/file/print detail`

## Skrip dan penjadwalan

Tugas rutin seperti backup harian, reboot dini hari, atau cek koneksi bisa
diotomatiskan dengan skrip + scheduler.

Buat skrip:

```bash
/system/script/add name=backup-harian source={
  /system/backup/save name=("backup-" . [/system/clock/get date])
  /export file=("konfig-" . [/system/clock/get date])
  /log/info "Backup harian selesai"
}
```

Jadwalkan eksekusi setiap hari:

```bash
/system/scheduler/add name=backup-harian interval=1d on-event=backup-harian
```

Contoh kegunaan scheduler lain:

| Skenario | Interval | Perintah inti |
| --- | --- | --- |
| Reboot mingguan | `1w` | `/system/reboot` |
| Ping watchdog | `5m` | `/ping count=3 8.8.8.8` lalu kirim notifikasi jika gagal |
| Backup otomatis | `1d` | Skrip `backup-harian` di atas |
| Matikan WiAX malam | `24h` | `/interface/wireless/disable 0` pada jam tertentu |

::: warning Hati-hati dengan reboot otomatis
Pastikan konfigurasi sudah **stabil** sebelum menjadwalkan reboot. Router yang
_macet setengah jalan_ karena skrip startup belum selesai saat reboot adalah
masalah yang merepotkan di lokasi terpencil.
:::

## Notifikasi email

Router bisa mengirim email — berguna untuk memberi tahu admin saat ada
peristiwa penting (misal backup gagal, reboot, atau serangan terdeteksi).

Konfigurasi SMTP (contoh Gmail):

```bash
/tool/e-mail/set address=smtp.gmail.com port=587 user=akun@gmail.com password=sandi-aplikasi
/tool/e-mail/send to=admin@example.com subject="Router menyala" body="Router sudah nyala setelah reboot."
```

::: warning App password Gmail
Gmail mewajibkan **App Password** (bukan sandi akun biasa) jika 2FA aktif.
Buat di `myaccount.google.com/apppasswords`. Untuk SMTP lain sesuaikan
`address` dan `port` (465/TLS atau 587/STARTTLS).
:::

Kombinasikan dengan scheduler untuk laporan status rutin. Buat skrip:

```bash
/system/script/add name=kirim-laporan source={
  /tool/e-mail/send to=admin@example.com subject="Laporan harian" body="Router aktif sejak [/system/resource/get uptime]"
}
```

Lalu jadwalkan:

```bash
/system/scheduler/add name=kirim-laporan interval=1d on-event=kirim-laporan start-time=07:00:00
```

Untuk firewall `output`, pastikan `tcp/587` (atau `tcp/465`) diizinkan keluar
menuju server SMTP.

## Uji pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Kamu akan mengubah firewall router di kota lain lewat SSH. Langkah pertama?
   → **Ctrl+X** (safe mode), sehingga salah blokir = otomatis batal.
2. Backup mana yang bisa dipakai memindahkan konfigurasi ke unit pengganti
   yang berbeda tipe? → `/export` (`.rsc`) — teks, bisa diedit menyesuaikan
   nama interface.
3. Kenapa `set 0` berbahaya di skrip? → Nomor urut berubah-ubah; gunakan
   `[find ...]`.

Alat sudah di tangan. Saatnya konfigurasi jaringan pertama:
[Interface & IP Address](/mikrotik/interface-ip).

</details>