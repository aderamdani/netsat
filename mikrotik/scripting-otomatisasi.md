---
title: Scripting & Otomatisasi
---

# Scripting & Otomatisasi

Mengelola puluhan router secara manual satu per satu sangat melelahkan dan rentan kesalahan. RouterOS dilengkapi dengan mesin *scripting* internal yang kuat, memungkinkan kita mengotomatiskan tugas-tugas administratif seperti pemantauan link, pencadangan berkas (*backup*), hingga pengiriman alarm status jaringan.

---

## 1. Sintaks Dasar Scripting RouterOS

Skrip RouterOS dieksekusi melalui command line (CLI) atau disimpan dalam menu `/system/script`. Semua perintah skrip harus diawali dengan karakter titik dua (`:`) jika merupakan perintah internal RouterOS (*built-in scripting command*).

### Variabel & Tipe Data
Kita dapat mendefinisikan variabel lokal (`:local`, hanya berlaku di blok kode berjalan) atau variabel global (`:global`, tersimpan di memori router dan bisa diakses skrip lain).

```bash
# Deklarasi variabel
:local namaRouter [/system/identity/get name]
:local statusLink "aktif"

# Menggabungkan string dan mencetak ke log
:put "Router $namaRouter dalam kondisi $statusLink"
/log info "Skrip berjalan di router $namaRouter"
```

### Operasi Logika & Kondisional (If-Else)
```bash
:local pingCount [/ping address=8.8.8.8 count=3]

:if ($pingCount = 0) do={
    /log warning "Koneksi internet putus!"
} else={
    :put "Internet normal, ping sukses: $pingCount"
}
```

### Perulangan (Foreach Loop)
Perulangan sangat berguna untuk memproses banyak interface, rute, atau IP sekaligus:
```bash
# Menelusuri semua interface Ethernet dan menonaktifkan yang statusnya link-down
:foreach i in=[/interface/ethernet/find] do={
    :local nama [/interface/ethernet/get $i name]
    :local status [/interface/ethernet/get $i running]
    
    :if ($status = false) do={
        /log info "Ethernet $nama tidak terhubung, mematikan interface..."
        /interface/ethernet/disable $i
    }
}
```

---

## 2. Pemantauan Link Lanjutan dengan Netwatch

Netwatch adalah alat pemantau otomatis RouterOS yang mengirimkan ping ke host target secara periodik. Saat host target merespons (*up*) atau gagal merespons (*down*), Netwatch akan mengeksekusi skrip kustom yang kita definisikan.

### Skrip Notifikasi Telegram saat Link Down (Satelit / Fiber Putus)

Di bawah ini adalah contoh mengirim notifikasi ke grup Telegram menggunakan API Telegram saat koneksi satelit Starlink/VSAT mengalami gangguan:

```bash
/tool/netwatch/add host=8.8.8.8 interval=30s timeout=1000ms \
    up-script="/system/script/run netwatch-up" \
    down-script="/system/script/run netwatch-down"
```

Kemudian buat skrip di `/system/script`:

**Skrip `netwatch-down`:**
```bash
# Konfigurasi API Telegram
:local botToken "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
:local chatId "-987654321"
:local rtrName [/system/identity/get name]

:local pesan "🚨 ALARM: Internet Utama di router $rtrName DOWN pada $[/system/clock/get date] $[/system/clock/get time]!"

# Kirim pesan via fetch API
/tool/fetch url="https://api.telegram.org/bot$botToken/sendMessage\?chat_id=$chatId&text=$pesan" keep-result=no
```

**Skrip `netwatch-up`:**
```bash
:local botToken "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
:local chatId "-987654321"
:local rtrName [/system/identity/get name]

:local pesan "✅ RECOVERY: Internet Utama di router $rtrName kembali UP pada $[/system/clock/get date] $[/system/clock/get time]!"

/tool/fetch url="https://api.telegram.org/bot$botToken/sendMessage\?chat_id=$chatId&text=$pesan" keep-result=no
```

---

## 3. Otomatisasi Backup & Upload Scheduled

Kehilangan konfigurasi router akibat petir atau kerusakan hardware adalah mimpi buruk. Kita bisa menjadwalkan router untuk membuat file backup konfigurasi biner (`.backup`) dan skrip ekspor konfigurasi (`.rsc`) setiap malam, lalu mengunggahnya ke server FTP/SFTP pusat.

### Langkah 1: Buat Skrip Backup & Upload (`system-backup`)
```bash
/system/script/add name=system-backup source={
    :local rtrName [/system/identity/get name]
    :local date [/system/clock/get date]
    # Ubah karakter "/" pada tanggal agar aman untuk nama file
    :local formatDS ""
    :for i from=0 to=([:len $date] - 1) do={
        :local char [:pick $date $i ($i + 1)]
        :if ($char = "/") do={ :set char "-" }
        :set formatDS "$formatDS$char"
    }
    
    :local backupFile "$rtrName-$formatDS"
    
    # 1. Jalankan pencadangan biner & ekspor teks
    /system/backup/save name=$backupFile dont-encrypt=yes
    /export file=$backupFile
    
    # Berikan waktu 5 detik agar file selesai ditulis ke disk
    :delay 5s
    
    # 2. Unggah file backup ke server penyimpanan pusat
    /tool/fetch address=192.168.88.5 src-path="$backupFile.backup" dst-path="/backups/$backupFile.backup" \
        port=21 protocol=ftp user="adminftp" password="passwordftp" upload=yes
        
    /tool/fetch address=192.168.88.5 src-path="$backupFile.rsc" dst-path="/backups/$backupFile.rsc" \
        port=21 protocol=ftp user="adminftp" password="passwordftp" upload=yes
        
    /log info "Backup otomatis selesai dan diunggah ke server FTP."
}
```

### Langkah 2: Buat Scheduler untuk Menjalankan Skrip Setiap Pukul 01:00 Pagi
```bash
/system/scheduler/add name=jadwal-backup start-time=01:00:00 interval=1d \
    on-event="/system/script/run system-backup" comment="Backup harian pukul 01:00 AM"
```

---

## 4. Skrip Dynamic DNS (IP Cloud) Auto-Update

Router yang menggunakan koneksi internet dengan IP Publik dinamis (berubah-ubah setiap kali modem restart) akan sulit untuk di-remote VPN dari luar. Kita dapat menggunakan fitur IP Cloud bawaan MikroTik, namun terkadang proses sinkronisasinya lambat. Skrip ini memaksa update IP Cloud setiap kali ada perubahan deteksi IP WAN:

```bash
/system/script/add name=ddns-update source={
    :local dynamicIP [/ip/address/get [find interface=ether1] address]
    # Potong subnet prefix (/24) agar menyisakan IP saja
    :local ipOnly [:pick $dynamicIP 0 [:find $dynamicIP "/"]]
    
    :global lastIP
    
    :if ($ipOnly != $lastIP) do={
        /log info "IP WAN berubah dari $lastIP menjadi $ipOnly. Melakukan sinkronisasi DDNS Cloud..."
        /ip/cloud/force-update
        :set lastIP $ipOnly
    }
}
```
*Pasang skrip ini pada scheduler dengan interval berjalan setiap 5 atau 10 menit.*

---

## Cek pemahaman

1. **Apa perbedaan antara `:local` dan `:global` dalam pembuatan variabel di RouterOS?**
2. **Mengapa pada perintah `/tool/fetch` untuk API Telegram tanda tanya (`?`) ditulis dengan backslash (`\?`)?**
3. **Bagaimana cara mencegah penjadwalan backup menguras memori internal (storage) router?**

<details>
<summary>Lihat jawaban</summary>

1. Variabel `:local` hanya hidup di dalam cakupan kode di mana ia dideklarasikan (fungsi atau skrip saat itu) dan langsung dihapus saat skrip selesai. Variabel `:global` tersimpan di RAM router secara permanen, sehingga nilainya dapat dibaca oleh skrip lain atau tetap tersimpan sampai router di-reboot.
2. Karena dalam sintaks RouterOS CLI, karakter tanda tanya (`?`) digunakan sebagai tombol bantuan (*help*). Menggunakan backslash `\` berfungsi untuk mengabaikan fungsi bantuan (*escape character*) sehingga karakter `?` terkirim sebagai bagian dari teks URL.
3. Dengan menambahkan baris penghapusan file lokal setelah proses upload FTP selesai di dalam skrip, misalnya menambahkan perintah: `/file/remove [find name="$backupFile.backup"]` dan `/file/remove [find name="$backupFile.rsc"]`.

</details>