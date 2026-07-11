---
title: Pengantar Starlink
---

# Pengantar Starlink

**Starlink** adalah layanan konstelasi satelit internet yang dikembangkan oleh **SpaceX**, perusahaan dirgantara milik Elon Musk. Berbeda dengan internet satelit tradisional yang menggunakan satu atau dua satelit besar di orbit geostasioner (GEO) yang sangat tinggi, Starlink menggunakan konstelasi ribuan satelit kecil yang saling terhubung di orbit bumi rendah (LEO - *Low Earth Orbit*).

Tujuan utama Starlink adalah menyediakan konektivitas internet pita lebar (*broadband*) berkecepatan tinggi dengan latensi rendah ke seluruh penjuru bumi — terutama ke area terpencil, pedalaman, maritim, dan daerah tertinggal yang belum terjangkau kabel serat optik (*fiber optic*) atau jaringan seluler.

---

## Konsep Konstelasi Satelit LEO

Untuk memahami keunikan Starlink, kita harus melihat bagaimana konstelasi ini dirancang secara masif:

*   **Ribuan Satelit:** Jika satelit GEO hanya membutuhkan 3 satelit untuk menjangkau bumi, Starlink membutuhkan ribuan satelit karena orbit LEO sangat dekat dengan bumi. Cakupan tiap satelit LEO sangat sempit.
*   **Kecepatan Tinggi:** Satelit Starlink mengorbit bumi dengan kecepatan sekitar **$27.000\text{ km/jam}$**, menyelesaikan satu putaran bumi dalam waktu sekitar **$90 - 100\text{ menit}$**.
*   **Tinggi Orbit Rendah:** Satelit Starlink berada di ketinggian sekitar **$550\text{ km}$** di atas permukaan bumi. Ketinggian ini sekitar **65 kali lebih dekat** dibandingkan satelit GEO ($35.786\text{ km}$).

```text
  [Satelit GEO] ────────────────────────── ~ 35.786 km (Latensi 600 ms)
  
  
  
  [Satelit LEO Starlink] ── ~ 550 km (Latensi 30 ms)
  
  [BUMI]
```

---

## Mengapa Latensi Rendah Sangat Penting?

Latensi adalah waktu yang dibutuhkan data untuk melakukan perjalanan pulang-pergi dari komputer pengirim ke penerima (*Round Trip Time* atau RTT). 
*   **Satelit GEO:** Karena jarak tempuh yang jauh ($36.000\text{ km}$ naik dan $36.000\text{ km}$ turun), hukum fisika (kecepatan cahaya) membatasi latensi minimum satelit GEO di kisaran **$500 - 600\text{ ms}$**.
*   **Starlink LEO:** Karena jaraknya hanya $550\text{ km}$, latensi Starlink berkisar antara **$25 - 45\text{ ms}$**.

Latensi rendah ini mengubah segalanya. Dengan Starlink, pengguna di pedalaman kini bisa melakukan aktivitas yang sebelumnya mustahil dilakukan lewat satelit tradisional, seperti:
*   Panggilan video (*video call*) tanpa jeda suara yang mengganggu.
*   Bekerja secara kolaboratif menggunakan aplikasi cloud interaktif (Microsoft Teams, Google Workspace).
*   Menggunakan VPN kantor cabang tanpa hambatan *timeout*.
*   Bermain game online real-time.

---

## Skala Proyek Starlink

Sejak peluncuran pertamanya pada tahun 2019, Starlink terus meluncurkan satelit menggunakan roket Falcon 9 milik SpaceX:

*   **Target Fase Pertama:** Lebih dari **$4.400$ satelit** aktif di langit.
*   **Target Jangka Panjang:** SpaceX telah mendapatkan izin untuk meluncurkan hingga **$12.000$ satelit**, bahkan merencanakan perluasan hingga **$42.000$ satelit**.
*   **Cakupan Global:** Layanan Starlink kini telah dinikmati oleh jutaan pelanggan aktif di berbagai benua, termasuk Indonesia (sejak tahun 2024), melayani sektor perumahan, perkebunan, pertambangan, maritim, dan instansi pemerintah.

---

## Cek Pemahaman

1.  Berapakah ketinggian rata-rata satelit Starlink dari bumi, dan mengapa hal tersebut membuat latensinya jauh lebih rendah dari VSAT GEO tradisional?
    <br>→ Satelit Starlink berada pada ketinggian sekitar $550\text{ km}$ di atas bumi. Jarak ini jauh lebih dekat dibanding satelit GEO ($35.786\text{ km}$), sehingga waktu perjalanan sinyal (yang bergerak dengan kecepatan cahaya) menjadi jauh lebih singkat, menghasilkan latensi RTT rendah ($\approx 30\text{ ms}$).
2.  Mengapa Starlink membutuhkan ribuan satelit aktif di angkasa, sementara satelit GEO hanya membutuhkan 3 satelit untuk mencakup hampir seluruh bumi?
    <br>→ Karena orbit LEO sangat rendah ($550\text{ km}$), area cakupan sinyal (*footprint*) satu satelit di atas permukaan bumi sangat kecil dan satelit meluncur dengan sangat cepat. Oleh karena itu, dibutuhkan jaringan ribuan satelit yang saling terhubung agar selalu ada satelit di atas langit pengguna setiap saat.
3.  Aplikasi apa saja yang kinerjanya sangat terpengaruh oleh latensi dan kini dapat berjalan dengan baik di Starlink tetapi tidak di VSAT GEO?
    <br>→ Aplikasi real-time seperti panggilan video (*video conferencing*), game online, koneksi VPN enkripsi tinggi, dan pertukaran database interaktif yang sensitif terhadap jeda waktu pengiriman paket.
