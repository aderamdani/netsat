---
title: Optimasi VPN & MTU/MSS Satelit
---

# Optimasi VPN & MTU/MSS Satelit

Membangun VPN (Virtual Private Network) seperti WireGuard, IPsec, L2TP, atau SSTP di atas koneksi satelit adalah hal biasa untuk mengamankan komunikasi data kantor cabang remote. Namun, tanpa optimasi yang tepat, kinerja VPN di link satelit sering kali terasa sangat lambat, bahkan untuk browsing ringan sekalipun.

Penyebab utamanya adalah kombinasi dari **overhead enkripsi**, **fragmentasi paket**, dan **latensi tinggi** satelit. Halaman ini menjelaskan mengapa hal ini terjadi dan bagaimana cara mengoptimasinya di RouterOS.

---

## Masalah Utama: Fragmentasi Paket di Link RTT Tinggi

Ketika data dikirim melalui VPN, paket data asli dibungkus (*kapsulasi*) dengan header tambahan (IP header baru, UDP/TCP header, dan enkripsi keamanan). Hal ini membuat ukuran paket membengkak.

```text
  Paket Data Asli (MTU 1500)
 ┌───────────────────────────────────────┐
 │ IP Header │         TCP DATA          │
 └───────────────────────────────────────┘
  
  Paket Setelah Dibungkus VPN (Ukuran Melebihi 1500)
 ┌────────────────────────────────────────────────────────┐
 │ VPN Header │ Enkripsi │ IP Header │     TCP DATA       │
 └────────────────────────────────────────────────────────┘
```

1.  **Batas MTU Fisik:** Standar ukuran paket maksimal yang bisa dilewati jaringan internet fisik (termasuk satelit) adalah **`1500 byte`** (disebut MTU - *Maximum Transmission Unit*).
2.  **Fragmentasi:** Jika ukuran paket VPN yang dibungkus melebihi `1500 byte`, paket tersebut harus dipecah menjadi dua bagian (fragmentasi) oleh router pengirim agar bisa lewat, dan dirakit kembali di router penerima.
3.  **Dampak pada Latensi Satelit:** 
    *   Jika salah satu pecahan paket hilang di tengah jalan, seluruh paket gabungan dianggap rusak dan harus dikirim ulang (*retransmission*).
    *   Pada link satelit GEO dengan RTT $\approx 600\text{ ms}$, pengiriman ulang satu pecahan paket ini membutuhkan waktu tambahan minimal $600\text{ ms}$. 
    *   Hal ini memicu algoritma kontrol kemacetan TCP (*TCP Congestion Control*) mengasumsikan terjadi kemacetan parah di jaringan, sehingga kecepatan transfer langsung dipangkas secara drastis (*drop throughput*).

---

## Solusi: Menghitung & Mengatur MTU VPN yang Tepat

Agar tidak terjadi fragmentasi, kita harus menurunkan nilai MTU pada interface virtual VPN di RouterOS agar ukuran total paket (data + enkripsi) tidak melebihi batas MTU fisik (`1500 byte`).

Berikut adalah rekomendasi nilai MTU untuk beberapa protokol VPN populer di atas link satelit:

| Protokol VPN | Estimasi Overhead | Rekomendasi MTU | Rekomendasi MSS |
| --- | --- | --- | --- |
| **WireGuard** | $60 - 80\text{ byte}$ | **`1420`** | **`1380`** |
| **L2TP / IPsec** | $60 - 80\text{ byte}$ | **`1410`** | **`1370`** |
| **IPsec (IKEv2 murni)**| $50 - 70\text{ byte}$ | **`1400`** | **`1360`** |
| **SSTP** (TCP-based) | $40\text{ byte}$ + TCP | **`1400`** | **`1360`** |

---

## Konfigurasi Mangle: Mengubah TCP MSS Otomatis

Meskipun kita sudah memperkecil MTU di sisi router, terkadang komputer client di jaringan LAN tetap mengirimkan paket dengan ukuran penuh (`1500 byte`).

Untuk memaksa komputer client mengirimkan paket yang pas dengan kapasitas VPN, RouterOS dapat memotong nilai **MSS (Maximum Segment Size)** pada saat proses jabat tangan TCP (*TCP Three-way Handshake*) menggunakan fitur Firewall Mangle.

### Langkah-Langkah Konfigurasi:

Tambahkan aturan mangle berikut di RouterOS. Aturan ini akan memindai paket TCP SYN yang lewat dan mengecilkan nilai MSS-nya secara dinamis sesuai dengan MTU interface VPN:

```routeros
/ip firewall mangle
# 1. Optimasi MSS untuk lalu lintas keluar lewat interface WireGuard (misal: wg-kantor)
add chain=forward action=change-mss new-mss=clamp-to-pmtu passthrough=no \
  protocol=tcp tcp-flags=syn out-interface=wg-kantor \
  comment="Clamp MSS WireGuard ke PMTU"

# 2. Aturan alternatif: Menetapkan nilai MSS statis (misal 1360) untuk semua interface VPN
add chain=forward action=change-mss new-mss=1360 passthrough=no \
  protocol=tcp tcp-flags=syn out-interface-list=WAN \
  comment="Paksa MSS maksimal 1360 untuk WAN Satelit"
```

### Penjelasan Parameter:
*   `tcp-flags=syn`: Aturan ini hanya bekerja pada paket inisiasi koneksi (SYN), sehingga tidak membebani kinerja CPU router untuk paket data setelahnya.
*   `new-mss=clamp-to-pmtu`: RouterOS secara otomatis akan menghitung nilai MSS terbaik berdasarkan MTU jalur keluar (biasanya MTU dikurangi $40$ byte untuk header IP/TCP).
*   `out-interface-list=WAN` atau `out-interface=wg-kantor`: Membatasi aturan ini hanya untuk paket yang keluar menuju internet satelit atau interface VPN agar lalu lintas LAN lokal tetap berjalan di kecepatan penuh.

---

## Cek Pemahaman

1.  Mengapa satu paket data yang terfragmentasi (terpecah) memiliki dampak penurunan performa yang jauh lebih buruk pada link satelit GEO dibanding link serat optik biasa?
    <br>→ Karena jika salah satu pecahan paket hilang, proses kirim ulang (*retransmission*) pada link satelit GEO memakan waktu RTT sangat tinggi ($\approx 600\text{ ms}$). Jeda waktu yang lama ini memicu mekanisme pencegahan kemacetan TCP untuk memotong kecepatan transfer data, membuat VPN terasa sangat lambat.
2.  Apa perbedaan antara MTU (Maximum Transmission Unit) dan MSS (Maximum Segment Size)?
    <br>→ MTU adalah ukuran maksimal dari **seluruh paket** (termasuk IP header, TCP header, dan muatan data) yang dapat dilewati oleh interface jaringan. Sedangkan MSS adalah batas ukuran maksimal **muatan data saja** (payload) yang dapat ditampung di dalam segmen TCP (biasanya nilai MTU dikurangi $40$ byte).
3.  Mengapa aturan *change-mss* pada firewall mangle hanya menargetkan paket dengan bendera/flag `tcp-flags=syn`?
    <br>→ Karena penentuan ukuran paket (MSS) disepakati oleh pengirim dan penerima di awal koneksi saat proses jabat tangan (*handshake*) TCP menggunakan paket SYN. Mengubah nilai MSS pada paket SYN sudah cukup untuk membatasi ukuran paket sepanjang sesi koneksi tersebut berjalan, sehingga menghemat daya pemrosesan CPU router.
