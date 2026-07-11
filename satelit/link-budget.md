---
title: Simulasi Link Budget
---

# Simulasi Link Budget

Link Budget adalah "akuntansi daya" dalam komunikasi nirkabel. Sederhananya, ini adalah perhitungan matematika untuk memastikan sinyal yang dipancarkan dari pemancar (uplink) masih memiliki kekuatan yang cukup saat diterima oleh penerima (downlink) setelah menempuh perjalanan puluhan ribu kilometer melintasi atmosfer dan ruang hampa.

Jika perhitungan link budget meleset, sinyal akan tenggelam dalam derau (noise), menyebabkan paket data hilang (*packet loss*), bit error rate (BER) melonjak, atau koneksi terputus total.

---

## Anggaran Daya: Ke mana perginya sinyal?

Bayangkan kamu memancarkan sinyal dari stasiun bumi. Perjalanan sinyal ini dapat digambarkan sebagai penambahan kekuatan (gain) dan pengurangan kekuatan (loss/redaman):

$$\text{Daya Diterima} = \text{Daya Pancar} + \text{Keuntungan Antena} - \text{Redaman Perjalanan} - \text{Redaman Cuaca}$$

Dalam unit logaritmik (Desibel/dB), kita cukup melakukan tambah-kurang biasa:

$$P_{rx} = P_{tx} + G_{tx} + G_{rx} - L_{fs} - L_{alt}$$

Di mana:
*   $P_{rx}$: Daya sinyal yang diterima di ujung sana ($dBW$ atau $dBm$).
*   $P_{tx}$: Daya pemancar (BUC di remote, atau HPA di hub) ($dBW$).
*   $G_{tx}$: *Gain* antena pengirim ($dBi$).
*   $G_{rx}$: *Gain* antena penerima ($dBi$).
*   $L_{fs}$: *Free Space Path Loss* (Redaman Ruang Hampa) ($dB$).
*   $L_{alt}$: Redaman tambahan (hujan, atmosfer, pointing melenceng) ($dB$).

---

## Musuh Terbesar: Free Space Path Loss (FSPL)

Sinyal radio menyebar seperti bola yang membesar. Semakin jauh ia merambat, semakin encer energinya di satu titik. Redaman ini disebut **Free Space Path Loss (FSPL)** dan dihitung dengan rumus:

$$FSPL = 20 \log_{10}(d) + 20 \log_{10}(f) + 32.44$$

Di mana:
*   $d$: Jarak antara stasiun bumi dan satelit ($\text{km}$).
*   $f$: Frekuensi kerja ($\text{MHz}$).

### Contoh Kasus: Bandingkan LEO vs GEO
Mari kita hitung FSPL pada frekuensi **Ku-band downlink (12 GHz atau 12.000 MHz)** untuk dua orbit yang berbeda:

1.  **Satelit GEO (Jarak $d \approx 36.000\text{ km}$):**
    $$FSPL = 20 \log_{10}(36000) + 20 \log_{10}(12000) + 32.44$$
    $$FSPL \approx 91.12 + 81.58 + 32.44 = 205.14\text{ dB}$$
2.  **Satelit LEO (Jarak $d \approx 550\text{ km}$):**
    $$FSPL = 20 \log_{10}(550) + 20 \log_{10}(12000) + 32.44$$
    $$FSPL \approx 54.80 + 81.58 + 32.44 = 168.82\text{ dB}$$

::: tip Selisih Desibel = Perbedaan Daya Nyata
Selisih antara GEO dan LEO pada frekuensi yang sama adalah sekitar **$36.3\text{ dB}$**. Karena skala desibel bersifat logaritmik, perbedaan $36\text{ dB}$ berarti sinyal dari satelit LEO diterima sekitar **4.000 kali lebih kuat** daripada satelit GEO. Inilah mengapa antena penerima Starlink (LEO) bisa berukuran sangat kecil dibanding parabola VSAT GEO untuk throughput yang setara!
:::

---

## Akuntansi Decibel: Eb/No dan C/N

Di sisi penerima, modem tidak hanya melihat seberapa kuat sinyal yang masuk, melainkan seberapa bersih sinyal tersebut dibanding derau di sekitarnya. Metrik ini dinyatakan dalam:

*   **$C/N$ (Carrier-to-Noise Ratio):** Perbandingan daya sinyal pembawa dengan daya derau pada lebar pita (bandwidth) tertentu.
*   **$Eb/No$ (Energy per Bit to Noise Power Spectral Density):** Ukuran kebersihan sinyal per bit data. Ini adalah metrik utama yang menentukan apakah modem bisa mendemodulasi paket data tanpa error.

Jika $Eb/No$ berada di bawah batas ambang (*threshold*) modem untuk jenis modulasi tertentu (misalnya $QPSK$), modem akan kehilangan sinkronisasi (*carrier loss*) dan link terputus.

---

## Rain Fade: Musuh Tropis di Frekuensi Tinggi

Air hujan adalah penyerap dan penyebar gelombang mikro yang sangat efektif. Ketika panjang gelombang sinyal mendekati ukuran tetesan air hujan, energi sinyal akan diserap dan diubah menjadi panas. Fenomena ini disebut **Rain Fade (Redaman Hujan)**.

Semakin tinggi frekuensi, semakin pendek panjang gelombangnya, dan semakin parah pengaruh hujan:

| Band | Frekuensi | Panjang Gelombang ($\lambda$) | Karakteristik Rain Fade | Ketahanan di Indonesia |
| --- | --- | --- | --- | --- |
| **C-band** | $4 - 6\text{ GHz}$ | $\approx 5.0\text{ cm}$ | Sangat kecil, gelombang melewati tetesan air hujan tanpa terganggu | **Sangat Tinggi** (Sinyal tetap stabil meski hujan lebat) |
| **Ku-band** | $11 - 14\text{ GHz}$ | $\approx 2.3\text{ cm}$ | Menengah, terjadi redaman nyata saat hujan deras | **Sedang** (Butuh margin daya tambahan pada antena) |
| **Ka-band** | $20 - 30\text{ GHz}$ | $\approx 1.2\text{ cm}$ | Sangat parah, bahkan mendung tebal pun bisa memicu redaman besar | **Rendah** (Memerlukan fitur mitigasi canggih seperti ACM) |

### Mitigasi Rain Fade: ACM (Adaptive Coding and Modulation)
Modem satelit modern menggunakan fitur **ACM** untuk melawan cuaca buruk secara dinamis:
1.  **Cuaca Cerah:** Satelit memancarkan data dengan modulasi tinggi (misal *32APSK*) untuk memaksimalkan throughput.
2.  **Hujan Mulai Turun:** Sinyal melemah. Modem melaporkan penurunan $Eb/No$ ke hub.
3.  **Adaptasi Otomatis:** Hub menurunkan tingkat modulasi secara dinamis (misal turun ke *16APSK*, lalu *QPSK*) dan memperbanyak bit koreksi error (*FEC - Forward Error Correction*).
4.  **Hasil:** Kecepatan internet menurun demi mencegah koneksi terputus total (*drop connection*).

---

## Cek Pemahaman

1.  Kenapa satelit GEO membutuhkan antena stasiun bumi yang jauh lebih besar (diameter $>1.2\text{ m}$) daripada penerima Starlink LEO ($0.3\text{ m}$)?
    <br>→ Karena satelit GEO berjarak $36.000\text{ km}$, mengalami redaman ruang hampa (FSPL) yang jauh lebih besar ($\approx 36\text{ dB}$ lebih besar). Antena besar berfungsi mengumpulkan lebih banyak energi sinyal (memiliki *gain* lebih tinggi) untuk mengompensasi kehilangan daya tersebut.
2.  Jika layanan VSAT menggunakan frekuensi Ka-band di daerah dengan curah hujan tinggi seperti Bogor atau Kalimantan, apa yang harus disiapkan dalam rancangan link budget?
    <br>→ Harus disiapkan **Link Margin (cadangan daya)** yang besar (antena remote lebih besar atau daya BUC lebih tinggi), serta mengaktifkan fitur ACM agar link tidak putus total saat hujan deras melanda.
3.  Mengapa frekuensi C-band masih menjadi pilihan utama untuk jaringan ATM perbankan di Indonesia meskipun bandwidth-nya lebih sempit?
    <br>→ Karena keandalannya terhadap cuaca (*availability*). Panjang gelombang C-band cukup besar sehingga tidak terganggu oleh tetesan air hujan tropis, memastikan transaksi ATM tetap berjalan tanpa hambatan dalam kondisi cuaca ekstrem sekalipun.
