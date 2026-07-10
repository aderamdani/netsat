---
title: Tentang NetSat
---

# Tentang NetSat

NetSat adalah dokumentasi belajar terbuka tentang **jaringan komputer** dan
**komunikasi satelit**, ditulis dalam bahasa Indonesia. Dua bidang ini biasanya
diajarkan terpisah, padahal keduanya adalah cerita yang sama: memindahkan bit
dari satu titik ke titik lain — bedanya hanya medium dan jarak.

## Kenapa digabung?

Trafik internet yang lewat VSAT di pelosok Indonesia tetap tunduk pada TCP/IP,
tetap butuh routing, dan tetap harus diamankan. Sebaliknya, memahami kenapa
latensi GEO ±500 ms merusak *TCP throughput* mustahil tanpa paham *three-way
handshake*. Belajar keduanya berdampingan membuat masing-masing lebih masuk akal.

## Cara membaca

| Kamu | Mulai dari |
| --- | --- |
| Baru mengenal jaringan | [Pengantar Jaringan](/networking/), lalu ikuti urutan sidebar |
| Sudah paham dasar jaringan | [Model OSI](/networking/model-osi) sebagai penyegar, lalu lompat ke topik yang dibutuhkan |
| Penasaran dengan satelit | [Pengantar Satelit](/satelit/) — bisa dibaca tanpa modul networking, tapi lebih kaya jika sudah |
| Bekerja dengan VSAT | [VSAT](/satelit/vsat) dan [Frekuensi & Band](/satelit/frekuensi-band) |
| Ingin langsung praktik di perangkat | [Pengantar RouterOS](/mikrotik/) — modul praktik MikroTik yang menautkan balik ke teorinya |

## Konvensi penulisan

- Istilah teknis yang sudah baku dalam bahasa Inggris (mis. *router*, *uplink*,
  *handshake*) tidak dipaksakan diterjemahkan.
- Angka penting ditulis dengan satuan lengkap dan dibulatkan seperlunya.
- Contoh konfigurasi memakai perangkat/alamat fiktif yang aman
  (RFC 5737: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`).

## Kontribusi

Sumber situs ini terbuka di
[github.com/aderamdani/netsat](https://github.com/aderamdani/netsat).
Menemukan kesalahan materi atau typo? Buka *issue* atau kirim *pull request*.
