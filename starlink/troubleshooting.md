---
title: Troubleshooting & Diagnostik Starlink
---

# Troubleshooting & Diagnostik Starlink

Mengelola koneksi satelit LEO membutuhkan pendekatan diagnostik yang berbeda dengan koneksi internet kabel biasa. Karena satelit berada di luar angkasa dan bergerak sangat cepat, gangguan bisa bersumber dari faktor lingkungan (hambatan pandangan), cuaca ekstrem, kerusakan kabel luar ruangan, hingga kelebihan beban catu daya.

Halaman ini membahas panduan troubleshooting dan pembacaan parameter diagnostik pada terminal Starlink.

---

## 1. Hambatan Fisik (Obstructions) — Penyebab Utama Sinyal Drop

Satelit LEO melintasi langit dengan kecepatan tinggi. Jika ada objek kecil (seperti pucuk pohon, tiang jemuran, atau ujung atap gedung) menghalangi garis pandang antena (*Line of Sight*), koneksi akan terputus selama 1 hingga 5 detik setiap kali satelit melintas di balik objek tersebut.

```text
       Satelit LEO Meluncur Cepat (27.000 km/h)
          ● ──────► ● ──────► [ ● HILANG SINYAL ] ──────► ●
                                  │
                                ┌─▼─┐  Pucuk Pohon menghalangi
                                │ 🌳│  garis pandang antena
                                └───┘
                                  ▲
                                 / \  (Sudut elevasi antena)
                                ┌───┐
                                │Ant│ Antena Starlink
                                └───┘
```

### Karakteristik Gejala Hambatan:
*   Speedtest normal dan kencang saat berjalan, tetapi terjadi **RTO (Request Time Out)** konstan setiap beberapa menit sekali.
*   Panggilan VoIP terputus sejenak atau game online mengalami *disconnect*.

### Solusi & Diagnostik:
1.  Buka aplikasi Starlink, masuk ke menu **Obstructions**.
2.  Lihat peta 3D hambatan. Area berwarna merah menunjukkan objek yang menghalangi.
3.  Pindahkan antena ke posisi yang lebih tinggi (menggunakan pipa tiang tambahan) agar mendapatkan sudut pandang langit $110^\circ - 140^\circ$ yang bersih total tanpa penghalang.

---

## 2. Gangguan Kabel & Konektor (Cable Connection Failures)

Kabel bawaan Starlink menyalurkan daya PoE tegangan tinggi sekaligus data gigabit ethernet. Konektor khusus Starlink Gen 2 rawan longgar atau teroksidasi oleh kelembapan udara luar ruangan.

### Gejala Kabel Bermasalah:
*   Status ethernet di port WAN MikroTik berulang kali berubah dari *UP* menjadi *DOWN* (link flapping).
*   Kecepatan negosiasi port ethernet turun dari `1 Gbps` menjadi `10 Mbps` atau `100 Mbps`.
*   Muncul notifikasi **"Starlink Disconnected"** atau **"Cable Ping Drop"** di aplikasi Starlink.

### Solusi & Diagnostik:
1.  Periksa ujung konektor kabel yang menancap di bawah antena dan di router bawaan. Bersihkan dari debu atau air, lalu colokkan kembali hingga berbunyi klik kencang.
2.  Gunakan pelindung air (*waterproof grease*) atau isolasi karet khusus pada sambungan luar ruangan.
3.  Lakukan ping ke IP manajemen antena (`192.168.100.1`) dari sisi MikroTik. Jika latensi ping lokal ini di atas `5 ms` atau banyak paket hilang, dapat dipastikan kabel atau adaptor ethernet mengalami kerusakan fisik.

---

## 3. Masalah Catu Daya & Overload Thermal

Satelit Starlink memiliki fitur **Snow Melt Mode** (pemanas otomatis) untuk memanaskan permukaan antena agar salju atau air hujan lebat tidak menumpuk dan meredam sinyal. 

Saat mode ini aktif, konsumsi daya antena melonjak tajam:
*   Tipe Standard Gen 3: Naik hingga **$100\text{ W}$**.
*   Tipe Flat High Performance: Naik hingga **$150\text{ W}$**.

### Gejala Masalah Daya:
*   Antena tiba-tiba melakukan restart (*boot looping*) saat terjadi hujan lebat atau cuaca dingin.
*   Modem mati total karena adaptor PoE kelebihan beban (*overcurrent*).

### Solusi & Diagnostik:
1.  Pastikan kapasitas catu daya UPS di lokasi remote memadai (minimal menyuplai daya konstan di atas kebutuhan puncak antena).
2.  Pada aplikasi Starlink, ubah setelan **Snow Melt Mode** dari *Automatic* menjadi *Off* jika Anda berada di wilayah tropis Indonesia yang tidak bersalju, untuk menghemat daya dan mencegah panas berlebih pada komponen internal antena (*thermal protection*).

---

## 4. Checklist Diagnostik Cepat

| Gejala Masalah | Kemungkinan Penyebab | Tindakan Perbaikan |
| --- | --- | --- |
| Ping RTO berkala setiap 5-10 menit | Terjadi hambatan fisik (*Obstruction*) | Pindahkan antena ke tempat yang lebih tinggi |
| Port interface WAN sering Up/Down | Kabel longgar atau teroksidasi air | Bersihkan konektor, gunakan isolasi karet |
| Latensi lokal ke `192.168.100.1` tinggi/loss | Kerusakan kabel atau adaptor ethernet | Ganti adaptor ethernet atau kabel Starlink |
| Antena reboot sendiri saat hujan lebat | Catu daya drop / overload thermal | Pasang UPS stabil, matikan fitur Snow Melt |
| Kecepatan internet tiba-tiba turun drastis | Kuota Prioritas habis (Enterprise) | Cek sisa kuota prioritas di portal Starlink |

---

## Cek Pemahaman

1.  Mengapa pucuk pohon yang hanya menghalangi sebagian kecil langit dapat menyebabkan koneksi Starlink terputus total selama beberapa detik secara berulang?
    <br>→ Karena satelit LEO bergerak sangat cepat melintasi langit. Ketika jalur lintasan satelit tersebut tepat berada di balik pucuk pohon yang menghalangi, sinyal gelombang mikro terblokir total hingga satelit berikutnya muncul di area langit yang bersih.
2.  Bagaimana cara mendeteksi kerusakan fisik pada kabel Starlink menggunakan perintah ping sederhana dari MikroTik RouterOS?
    <br>→ Lakukan ping ke IP manajemen antena (`192.168.100.1`). Jika latensi ping lokal ini berfluktuasi tinggi ($>5\text{ ms}$) atau mengalami *packet loss*, berarti terjadi kegagalan transmisi data fisik pada kabel atau konektor ethernet.
3.  Mengapa penonaktifan fitur *Snow Melt Mode* direkomendasikan pada instalasi Starlink di wilayah tropis seperti Indonesia?
    <br>→ Karena di wilayah tropis tidak ada salju, sehingga mematikan fitur ini akan menghemat konsumsi daya listrik antena (mencegah lonjakan daya hingga $150\text{ W}$) dan meminimalkan resiko panas berlebih (*overheating*) pada sirkuit internal antena.
