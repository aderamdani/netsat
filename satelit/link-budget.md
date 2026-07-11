---
title: Simulasi Link Budget
---

# Simulasi Link Budget

Link budget adalah "akuntansi daya" komunikasi nirkabel: perhitungan untuk
memastikan sinyal yang dipancarkan masih cukup kuat saat tiba di penerima,
setelah menempuh puluhan ribu kilometer atmosfer dan ruang hampa. Halaman ini
melanjutkan [teori dasarnya](/satelit/komunikasi#link-budget-akuntansi-desibel)
dengan hitungan yang benar-benar dikerjakan.

Jika link budget meleset, sinyal tenggelam dalam derau: *packet loss*, BER
melonjak, atau koneksi putus total.

## Anggaran daya: ke mana perginya sinyal?

Perjalanan sinyal adalah penjumlahan penguatan (gain) dan pengurangan redaman
(loss). Dalam unit logaritmik (desibel), perkalian menjadi tambah-kurang biasa:

```text
Daya diterima = Daya pancar + Gain antena − Redaman perjalanan − Redaman cuaca

P_rx = P_tx + G_tx + G_rx − L_fs − L_alt
```

| Simbol | Arti | Satuan |
| --- | --- | --- |
| `P_rx` | Daya sinyal yang diterima di ujung sana | dBW / dBm |
| `P_tx` | Daya pemancar (BUC di remote, HPA di hub) | dBW |
| `G_tx` | Gain antena pengirim | dBi |
| `G_rx` | Gain antena penerima | dBi |
| `L_fs` | *Free space path loss* (redaman ruang bebas) | dB |
| `L_alt` | Redaman tambahan: hujan, atmosfer, pointing melenceng | dB |

## Musuh terbesar: Free Space Path Loss (FSPL)

Sinyal radio menyebar seperti bola yang membesar — makin jauh merambat, makin
encer energinya di satu titik. Rumusnya (d dalam km, f dalam MHz):

```text
FSPL = 20 × log10(d) + 20 × log10(f) + 32,44
```

### Contoh kasus: bandingkan LEO vs GEO

FSPL pada frekuensi Ku-band downlink (12 GHz = 12.000 MHz):

| Orbit | Jarak | Perhitungan | FSPL |
| --- | --- | --- | --- |
| **GEO** | ±36.000 km | 91,12 + 81,58 + 32,44 | **±205,1 dB** |
| **LEO** | ±550 km | 54,80 + 81,58 + 32,44 | **±168,8 dB** |

::: tip Selisih desibel = perbedaan daya nyata
Selisih GEO−LEO ±36,3 dB. Karena desibel logaritmik, 36 dB berarti sinyal
dari satelit LEO tiba sekitar **4.000 kali lebih kuat** daripada dari GEO.
Itulah kenapa dish Starlink bisa sekecil kotak pizza, sementara VSAT GEO
butuh parabola — untuk throughput yang setara.
:::

## Akuntansi desibel: Eb/No dan C/N

Modem penerima tidak hanya melihat seberapa *kuat* sinyal, tapi seberapa
*bersih* dibanding derau di sekitarnya:

- **C/N** (*carrier-to-noise ratio*) — perbandingan daya sinyal pembawa
  terhadap daya derau pada bandwidth tertentu.
- **Eb/No** (*energy per bit / noise density*) — kebersihan sinyal per bit
  data; metrik utama penentu apakah modem bisa mendemodulasi tanpa error.

Jika Eb/No jatuh di bawah ambang (*threshold*) modem untuk modulasi yang
dipakai (misalnya QPSK), modem kehilangan sinkronisasi (*carrier loss*) dan
link terputus.

## Rain fade: musuh tropis di frekuensi tinggi

Air hujan menyerap dan menghamburkan gelombang mikro. Ketika panjang
gelombang sinyal mendekati ukuran tetesan hujan, energinya diserap menjadi
panas — **rain fade**. Makin tinggi frekuensi, makin pendek gelombangnya,
makin parah dampak hujan:

| Band | Frekuensi | Panjang gelombang | Karakter rain fade | Ketahanan di Indonesia |
| --- | --- | --- | --- | --- |
| **C** | 4–6 GHz | ±5,0 cm | Sangat kecil — gelombang melewati tetesan hujan | **Sangat tinggi** (stabil meski hujan lebat) |
| **Ku** | 11–14 GHz | ±2,3 cm | Menengah — redaman nyata saat hujan deras | **Sedang** (butuh margin daya tambahan) |
| **Ka** | 20–30 GHz | ±1,2 cm | Sangat parah — mendung tebal pun terasa | **Rendah** (wajib mitigasi seperti ACM) |

Peta band lengkap beserta regulasinya ada di
[Frekuensi & Band](/satelit/frekuensi-band#redaman-hujan-isu-nomor-satu-di-indonesia).

### Mitigasi rain fade: ACM (Adaptive Coding and Modulation)

Modem satelit modern melawan cuaca secara dinamis:

1. **Cuaca cerah** — modulasi tinggi (mis. 32APSK) untuk throughput maksimum.
2. **Hujan mulai turun** — sinyal melemah; modem melaporkan penurunan Eb/No
   ke hub.
3. **Adaptasi otomatis** — hub menurunkan modulasi (16APSK → QPSK) dan
   memperbanyak bit koreksi error (FEC).
4. **Hasil** — kecepatan turun demi mencegah koneksi putus total.

Detail modulasi & coding-nya di
[Komunikasi Satelit](/satelit/komunikasi#modulasi-dan-coding).

## Cek Pemahaman

1. Kenapa satelit GEO butuh antena stasiun bumi jauh lebih besar (diameter
   >1,2 m) daripada penerima Starlink LEO (±0,3 m)?
   <br>→ Jarak GEO ±36.000 km membuat FSPL-nya ±36 dB lebih besar. Antena
   besar mengumpulkan lebih banyak energi (gain lebih tinggi) untuk
   mengompensasi kehilangan daya itu.
2. Layanan VSAT Ka-band di daerah curah hujan tinggi (Bogor, Kalimantan) —
   apa yang harus disiapkan di link budget-nya?
   <br>→ **Link margin** besar (antena lebih besar atau daya BUC lebih
   tinggi) plus ACM aktif, agar link bertahan saat hujan deras.
3. Kenapa C-band masih jadi pilihan utama jaringan ATM perbankan Indonesia
   meski bandwidth-nya sempit?
   <br>→ **Availability**: panjang gelombang C-band cukup besar sehingga
   nyaris tak terganggu tetesan hujan tropis — transaksi tetap jalan di
   cuaca ekstrem sekalipun.
