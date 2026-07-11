---
title: Spesifikasi Perangkat Keras Starlink
---

# Spesifikasi Perangkat Keras Starlink

Penyediaan internet berkecepatan tinggi dari orbit rendah bumi memerlukan perangkat keras canggih di sisi pengguna. Sejak diluncurkan pertama kali, SpaceX telah merilis beberapa generasi terminal pengguna (*User Terminal* atau *Dish*) dengan perbedaan spesifikasi, konsumsi daya, dan jenis koneksi kabel.

Halaman ini mengulas anatomi dan spesifikasi teknis dari masing-masing tipe perangkat keras Starlink untuk membantu perancangan jaringan di lapangan.

---

## Perbandingan Antena (Dish) Starlink

SpaceX membagi perangkat kerasnya ke dalam beberapa model utama:

```text
   Gen 1 (Bulat)       Gen 2 (Persegi Actuated)      Gen 3 (Kickstand)      Flat High Performance
    ┌─────────┐              ┌───────────┐             ┌───────────┐             ┌─────────────┐
    │  ● ● ●  │              │           │             │           │             │             │
    │  ● ● ●  │              │           │             │           │             │             │
    └────┬────┘              └─────┬─────┘             └─────┬─────┘             └──────┬──────┘
         │ Tiang                   │ Tiang                   │ Penyangga                │ Braket Datar
      (Motor)                   (Motor)                  (Manual)                   (Statis)
```

| Parameter Spesifikasi | Gen 1 (Circular) | Gen 2 (Standard Actuated) | Gen 3 (Standard) | Flat High Performance |
| --- | --- | --- | --- | --- |
| **Bentuk Fisik** | Bulat (Diameter $58.9\text{ cm}$) | Persegi ($51.3 \times 30.3\text{ cm}$) | Persegi ($59.4 \times 38.3\text{ cm}$) | Persegi Datar ($57.5 \times 51.1\text{ cm}$) |
| **Motor Penggerak** | Ada (Self-pointing) | Ada (Self-pointing) | Tidak Ada (Kickstand Manual) | Tidak Ada (Pemasangan Flat Statis) |
| **Sudut Pandang (FoV)**| $110^\circ$ | $110^\circ$ | $110^\circ$ | **$140^\circ$** (Sangat Luas) |
| **Konsumsi Daya** | $90 - 150\text{ W}$ | $50 - 75\text{ W}$ | $75 - 100\text{ W}$ | **$110 - 150\text{ W}$** |
| **Peringkat Cuaca** | IP54 | IP56 | **IP67** (Tahan Air Tinggi) | **IP67** (Tahan Air Tinggi) |
| **Aplikasi Utama** | Residensial Awal (Pensiun) | Residensial / Roam Umum | Residensial v3 / Bisnis Baru | **Enterprise / Maritim / Mobilitas** |

---

## Detail Generasi Perangkat

### 1. Gen 2 (Standard Actuated) — Si Kecil Motorized
Merupakan antena paling populer di pasar Indonesia saat ini.
*   **Motor Penggerak:** Memiliki motor internal yang akan berputar otomatis saat dinyalakan untuk mencari sudut langit terbaik yang bersih dari hambatan.
*   **Tantangan Konektor:** Menggunakan kabel proprietary berujung konektor **SPX** khusus (bukan RJ45 standar). Konektor ini rawan longgar atau kemasukan air jika dipasang di luar ruangan tanpa pelindung.
*   **Ketiadaan Port LAN:** Router bawaan Gen 2 tidak memiliki port RJ45. Pengguna wajib membeli **Starlink Ethernet Adapter** tambahan agar bisa menghubungkannya ke router pihak ketiga (seperti MikroTik).

### 2. Gen 3 (Standard Kickstand) — Era Datar & RJ45 Standar
Merupakan standar terbaru yang dirancang untuk keandalan dan kemudahan instalasi.
*   **Tanpa Motor:** Antena ini tidak bergerak secara mekanis. Penyetelan arah (*pointing*) dilakukan sekali di awal instalasi secara manual memanfaatkan panduan kamera *Augmented Reality* (AR) pada aplikasi Starlink di HP.
*   **Koneksi RJ45 Standar:** Antena dan router Gen 3 terhubung menggunakan kabel ethernet Cat6 berpelindung (*shielded*) standar dengan konektor RJ45 tahan air, memudahkan penggantian kabel jika terjadi kerusakan.
*   **Router Wi-Fi 6:** Router bawaan Gen 3 memiliki **2 port ethernet RJ45 bypass bawaan** di bagian belakang, sehingga tidak memerlukan adaptor tambahan untuk koneksi kabel ke router lain.

### 3. Flat High Performance — Kelas Industri & Mobilitas
Didesain khusus untuk kebutuhan korporat, maritim, dan kendaraan bergerak.
*   **Sudut Pandang $140^\circ$:** Bidang pandang langit yang sangat luas memungkinkannya mendeteksi dan terhubung dengan satelit LEO cadangan saat satelit utama terhalang objek.
*   **Toleransi Gangguan Tinggi:** Sangat andal digunakan di tengah hutan perkebunan, tebing pertambangan, maupun saat hujan badai di laut lepas.
*   **Daya Pancar Lebih Tinggi:** Mampu mempertahankan kecepatan transmisi data (*throughput*) yang stabil di kondisi ekstrem.

---

## Power over Ethernet (PoE) & Catu Daya di Site Remote

Satelit Starlink beroperasi menggunakan teknologi **Power over Ethernet (PoE)** bertegangan tinggi untuk menyuplai daya dari dalam ruangan menuju antena di luar ruangan:

*   **Tegangan Operasional:** Umumnya berkisar antara **$48\text{ V}$ hingga $57\text{ V}$ DC**.
*   **Kebutuhan Arus Tinggi:** Pada antena Flat High Performance, arus listrik yang dialirkan bisa mencapai **$2.5\text{ A}$** (terutama saat pemanas es otomatis aktif).
*   **Pentingnya UPS di Site Remote:** Antena Starlink membutuhkan waktu sekitar **3 hingga 10 menit** untuk melakukan proses booting, mencari sinyal satelit, dan melakukan sinkronisasi IP (*handshake*). Jika site remote mengalami pemadaman listrik sekejap tanpa UPS, koneksi internet akan lumpuh total selama beberapa menit tersebut. Wajib memasang UPS minimal kapasitas $600\text{ VA}$ untuk menjaga kestabilan catu daya router dan antena Starlink.

---

## Cek Pemahaman

1.  Kenapa antena Starlink Gen 3 (Standard) dirancang tanpa motor penggerak mekanis seperti pada Gen 2?
    <br>→ Untuk mengurangi titik kegagalan mekanis (*mechanical failure point*) akibat keausan motor di cuaca luar ruangan yang ekstrem, menyederhanakan struktur perangkat keras, serta menurunkan biaya produksi.
2.  Apa keunggulan utama dari antena tipe *Flat High Performance* dibanding tipe *Standard Actuated* jika dipasang pada area dengan sedikit hambatan pohon (seperti pinggiran hutan)?
    <br>→ Tipe Flat High Performance memiliki sudut pandang (*Field of View*) yang jauh lebih luas ($140^\circ$ vs $110^\circ$). Hal ini memungkinkannya melacak lebih banyak satelit LEO secara bersamaan dan mengurangi potensi *drop connection* akibat hambatan fisik di sekitar antena.
3.  Tindakan pengamanan apa yang wajib dilakukan pada instalasi kelistrikan Starlink di site remote yang sering mengalami tegangan listrik naik-turun (*voltage spike*)?
    <br>→ Wajib menggunakan **UPS (Uninterruptible Power Supply)** berkualitas untuk menstabilkan tegangan dan mencegah pemadaman sekejap, karena proses booting dan sinkronisasi satelit Starlink membutuhkan waktu cukup lama (3 hingga 10 menit).
