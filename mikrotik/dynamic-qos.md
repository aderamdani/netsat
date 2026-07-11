---
title: Otomatisasi Antrean QoS Dinamis
---

# Otomatisasi Antrean QoS Dinamis

Pada bab [Wireless & Satelit](/mikrotik/wireless-dan-satelit#routeros-di-jaringan-vsat), kita belajar bahwa batas antrean QoS (`max-limit`) di RouterOS harus dikonfigurasi **sedikit di bawah kapasitas nyata** link satelit. Hal ini memastikan proses antrean terjadi di router kita (yang dapat kita atur prioritasnya), bukan di dalam buffer modem satelit yang tidak bisa kita kontrol (*bufferbloat*).

Namun, kapasitas link satelit frekuensi tinggi (Ku-band atau Ka-band) bersifat dinamis. Saat cuaca buruk/hujan lebat, fitur ACM satelit akan menurunkan modulasi sehingga kapasitas bandwidth riil menurun (misalnya dari 10 Mbps turun menjadi 3 Mbps). Jika QoS kita tetap membatasi di 10 Mbps, maka kontrol antrean akan berpindah kembali ke modem satelit, dan trafik kritis seperti VoIP atau database transaksi akan terganggu.

Materi praktik ini membahas solusi otomatisasi: **Dynamic QoS** menggunakan fitur **Netwatch** di RouterOS v7 untuk menyesuaikan alokasi bandwidth secara otomatis berdasarkan kondisi link.

---

## Logika Sistem Kontrol

| Kondisi link | Kapasitas riil | Deteksi | Aksi QoS RouterOS |
| --- | --- | --- | --- |
| Cuaca cerah | Stabil ±10 Mbps | — (kondisi normal) | `max-limit` di-set 9,5 Mbps (sedikit di bawah kapasitas) |
| Hujan lebat | Turun ke ±3 Mbps (ACM menurunkan modulasi) | Netwatch melihat loss / latensi naik | Skrip menurunkan `max-limit` ke 2,7 Mbps |
| Cuaca pulih | Kembali ±10 Mbps | Netwatch melihat link sehat | Skrip mengembalikan `max-limit` ke 9,5 Mbps |

---

## Langkah 1: Siapkan Antrean Induk (Parent Queue)

Kita buat sebuah antrean sederhana (*Simple Queue*) sebagai induk dari semua pembagian bandwidth di LAN. Kita beri nama `sat-parent` dengan limit awal cuaca cerah sebesar **10 Mbps**:

```routeros
/queue simple
add name=sat-parent target=192.168.88.0/24 max-limit=10M/10M comment="QoS Induk Satelit"
```

---

## Langkah 2: Konfigurasi Monitoring dengan Netwatch v7

Di RouterOS v7, Netwatch tidak hanya bisa mendeteksi status UP/DOWN berdasarkan ping sederhana, tetapi juga dapat memantau kualitas link secara spesifik menggunakan tipe probe **ICMP**:

Kita akan memantau IP gateway hub satelit (misal: `203.0.113.1`). Kita buat aturan untuk memicu skrip ketika kualitas link memburuk (latensi rata-rata >900 ms atau terjadi *packet loss* >15%).

```routeros
/tool netwatch
add host=203.0.113.1 type=icmp interval=20s thresh-latency-avg=900ms thresh-loss-percent=15% \
  down-script=skrip-cuaca-buruk up-script=skrip-cuaca-cerah disabled=no \
  comment="Pemantau Kualitas Link Satelit"
```

*   `down-script`: Akan dijalankan ketika salah satu batas ambang (*threshold*) terlampaui (latensi >900 ms atau loss >15%).
*   `up-script`: Akan dijalankan ketika kondisi link kembali normal (di bawah ambang batas).

---

## Langkah 3: Tulis Skrip Otomatisasi

Sekarang kita buat dua buah skrip di menu `/system script` yang akan dipanggil oleh Netwatch di atas.

### 1. Skrip untuk Cuaca Buruk (`skrip-cuaca-buruk`)
Skrip ini akan menurunkan `max-limit` antrean `sat-parent` menjadi **3 Mbps** untuk menyesuaikan penurunan kapasitas satelit saat hujan:

```routeros
/system script
add name=skrip-cuaca-buruk source={
  :log warning "NetSat-Alert: Sinyal satelit melemah (redaman hujan). Menurunkan limit QoS ke 3 Mbps."
  /queue simple set [find name="sat-parent"] max-limit=3M/3M
}
```

### 2. Skrip untuk Cuaca Cerah (`skrip-cuaca-cerah`)
Skrip ini akan mengembalikan `max-limit` antrean `sat-parent` ke kapasitas penuh sebesar **10 Mbps** setelah cuaca kembali cerah dan link stabil:

```routeros
/system script
add name=skrip-cuaca-cerah source={
  :log info "NetSat-Info: Sinyal satelit kembali normal. Mengembalikan limit QoS ke 10 Mbps."
  /queue simple set [find name="sat-parent"] max-limit=10M/10M
}
```

---

## Pengujian Sistem

1.  Kamu bisa melihat catatan aktivitas skrip pada menu `/log print`.
2.  Untuk melakukan simulasi cuaca buruk secara manual tanpa menunggu hujan, kamu bisa mengubah sementara nilai ambang batas (*threshold*) Netwatch menjadi sangat rendah (misal `thresh-latency-avg=100ms`). Netwatch akan langsung mendeteksi kondisi "DOWN" dan menjalankan skrip penurunan bandwidth.
3.  Periksa apakah `max-limit` pada Simple Queue `sat-parent` berubah secara dinamis di WinBox atau CLI dengan perintah `/queue/simple/print`.

---

## Cek Pemahaman

1.  Kenapa kita tidak boleh membiarkan batas limit QoS (`max-limit`) tetap di 10 Mbps ketika kapasitas riil satelit menurun menjadi 3 Mbps saat hujan lebat?
    <br>→ Karena jika batas limit tetap 10 Mbps, antrean data tidak akan tertahan di router (karena router merasa masih ada sisa bandwidth). Paket data akan langsung diteruskan ke modem satelit dan menumpuk di buffer modem. Hal ini menyebabkan penundaan (*bufferbloat*) yang parah dan membuat aturan prioritas QoS di router tidak berfungsi sama sekali.
2.  Apa keunggulan fitur Netwatch di RouterOS v7 dibanding versi sebelumnya (RouterOS v6) dalam konteks memantau link satelit?
    <br>→ Netwatch di RouterOS v7 mendukung tipe probe ICMP yang lebih canggih. Kita tidak hanya mendeteksi apakah suatu host hidup atau mati (UP/DOWN), tetapi juga bisa memantau metrik kualitas link seperti rata-rata latensi (*latency-avg*), variasi latensi (*jitter*), dan persentase paket hilang (*loss-percent*).
3.  Di mana kita bisa memverifikasi apakah skrip otomatisasi QoS berjalan dengan sukses ketika terjadi gangguan cuaca?
    <br>→ Kita bisa memeriksa catatan log sistem menggunakan perintah `/log print` untuk melihat pesan alert kustom yang kita buat, dan memantau perubahan nilai `max-limit` pada menu `/queue/simple/print` secara real-time.
