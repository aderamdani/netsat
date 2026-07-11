---
title: Troubleshooting & Diagnostik Starlink
---

# Troubleshooting & Diagnostik Starlink

Mendiagnosis satelit LEO berbeda dengan internet kabel: satelit bergerak
cepat, antena berada di luar ruangan, dan gangguan bisa datang dari halangan
pandangan, cuaca, kabel, sampai catu daya. Halaman ini merangkum pola gejala
→ penyebab → solusi yang paling sering ditemui di lapangan — pendekatannya
tetap [berpikir per lapisan](/networking/model-osi#berpikir-per-lapisan-saat-troubleshooting),
dimulai dari yang paling fisik.

## 1. Hambatan fisik (obstructions) — penyebab utama sinyal drop

Satelit LEO melintasi langit dengan cepat (±27.000 km/jam). Objek kecil yang
menghalangi garis pandang antena — pucuk pohon, tiang, ujung atap — memutus
koneksi 1–5 detik **setiap kali** ada satelit melintas di baliknya.

```text
       Satelit LEO meluncur cepat (±27.000 km/jam)
          ● ──────► ● ──────► [ ● HILANG SINYAL ] ──────► ●
                                  │
                                ┌─▼─┐  Pucuk pohon menghalangi
                                │ 🌳│  garis pandang antena
                                └───┘
                                  ▲
                                 / \  (sudut pandang antena)
                                ┌───┐
                                │Ant│ Antena Starlink
                                └───┘
```

**Gejala khas:** speedtest kencang, tapi **RTO berkala** setiap beberapa
menit; VoIP terputus sejenak; game online *disconnect*.

**Solusi & diagnostik:**

1. Buka aplikasi Starlink → menu **Obstructions**; area merah pada peta 3D =
   objek penghalang.
2. Pindahkan/tinggikan antena (pipa tiang tambahan) sampai sudut pandang
   langit 110°–140° benar-benar bersih.

## 2. Gangguan kabel & konektor

Kabel Starlink membawa daya PoE tegangan tinggi sekaligus data gigabit.
Konektor proprietary Gen 2 rawan longgar dan teroksidasi kelembapan.

**Gejala khas:**

- Port WAN MikroTik bolak-balik *up/down* (link flapping).
- Negosiasi port turun dari 1 Gbps ke 100/10 Mbps.
- Notifikasi **"Starlink Disconnected"** / **"Cable Ping Drop"** di aplikasi.

**Solusi & diagnostik:**

1. Periksa dan bersihkan konektor di bawah antena dan di router; colok ulang
   sampai berbunyi klik.
2. Lindungi sambungan luar ruangan dengan gel kedap air/isolasi karet.
3. Ping IP manajemen antena dari MikroTik: `/ping 192.168.100.1`. Latensi
   lokal >5 ms atau ada paket hilang = kabel/adaptor bermasalah — ini ping
   segmen kabel saja, belum menyentuh angkasa.

## 3. Masalah catu daya & thermal

Fitur **Snow Melt Mode** memanaskan permukaan antena agar salju/air tidak
menumpuk. Saat aktif, konsumsi daya melonjak: Gen 3 hingga ±100 W, Flat High
Performance hingga ±150 W.

**Gejala khas:** antena restart sendiri (*boot loop*) saat hujan lebat;
adaptor PoE mati karena *overcurrent*.

**Solusi & diagnostik:**

1. Pastikan UPS/catu daya sanggup memikul kebutuhan **puncak** antena, bukan
   rata-ratanya.
2. Di wilayah tropis Indonesia yang tak bersalju, set **Snow Melt Mode** ke
   *Off* — menghemat daya dan mengurangi panas komponen.

## 4. Checklist diagnostik cepat

| Gejala | Kemungkinan penyebab | Tindakan |
| --- | --- | --- |
| Ping RTO berkala tiap beberapa menit | Hambatan fisik (*obstruction*) | Tinggikan/pindahkan antena |
| Port WAN sering up/down | Kabel longgar / teroksidasi | Bersihkan konektor, isolasi kedap air |
| Latensi ke `192.168.100.1` tinggi/loss | Kabel atau adaptor ethernet rusak | Ganti adaptor/kabel |
| Antena reboot saat hujan lebat | Catu daya drop / overload | UPS memadai, matikan Snow Melt |
| Kecepatan tiba-tiba anjlok | Kuota Priority habis (Enterprise) | Cek sisa kuota di portal |

## Cek pemahaman

1. Mengapa pucuk pohon yang menghalangi sebagian kecil langit bisa memutus
   koneksi total beberapa detik berulang kali?
   <br>→ Satelit LEO bergerak cepat melintasi langit; setiap kali lintasannya
   tepat di balik penghalang, sinyal terblokir sampai satelit berikutnya
   muncul di area langit yang bersih.
2. Bagaimana mendeteksi kerusakan kabel Starlink hanya dengan ping dari
   RouterOS?
   <br>→ Ping `192.168.100.1` (IP manajemen antena). Jalur ini murni kabel
   lokal — latensi >5 ms atau packet loss berarti kabel/konektor/adaptor
   bermasalah, bukan satelitnya.
3. Mengapa Snow Melt Mode disarankan dimatikan di Indonesia?
   <br>→ Tidak ada salju yang perlu dicairkan; mematikannya menghemat daya
   (mencegah lonjakan hingga ±150 W) dan mengurangi risiko panas berlebih.

---

## Modul Starlink selesai

Kamu kini memegang gambaran utuh: [mengapa LEO](/starlink/) mengubah
permainan latensi, [bagaimana arsitekturnya](/starlink/arsitektur) bekerja,
[perangkat apa](/starlink/hardware) yang dipasang, [paket mana](/starlink/layanan)
yang dipilih, dan [cara mengintegrasikannya](/starlink/praktik-mikrotik)
dengan RouterOS. Bandingkan dengan dunia [VSAT GEO](/satelit/vsat) di
[LEO vs VSAT vs Starlink](/satelit/leo-vsat-starlink) — lalu pilih alat yang
tepat untuk masalah yang tepat.
