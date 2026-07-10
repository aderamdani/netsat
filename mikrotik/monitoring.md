---
title: Operasi & Monitoring
---

# Operasi & Monitoring

Konfigurasi yang baik harus dipantau, dicatat, dan dirawat. Halaman ini
melengkapi [Manajemen Perangkat](/mikrotik/manajemen) dengan alat-alat
operasional: SNMP, bandwidth test, torch, fetch, sertifikat, dan container.

## SNMP: jendela bagi sistem monitoring

SNMP membuka baca (dan tulis) informasi router ke sistem monitoring seperti
Zabbix, LibreNMS, atau MRTG.

```bash
/snmp/community/add name=monitor address=192.0.2.0/24 security=read-only
/snmp/set enabled=yes contact="noc@example.com" location="DC Jakarta"
```

- `security=read-only` — jangan pernah pakai `write` di luar kebutuhan khusus.
- `address=` batasi subnet yang boleh menjangkau — jangan buka ke internet.
- Cek dari monitor: `snmpwalk -v2c -c monitor 192.0.2.1 .1.3.6.1.2.1.1`

Trap — notifikasi event langsung ke monitor:

```bash
/snmp/traps/set enabled=yes
```

## Bandwidth test: ukur throughput nyata

RouterOS punya server dan client bandwidth test built-in — berguna untuk
menguji throughput link sebelum dan sesudah QoS.

**Siapkan server** di satu sisi:

```bash
/tool/bandwidth-server/set enabled=yes authenticate=yes
```

**Jalankan client** dari router lain:

```bash
/tool/bandwidth-test address=192.0.2.1 direction=both user=admin password=...
```

- `direction=both` — upload dan download sekaligus.
- `protocol=udp` — pakai UDP (default TCP kadang kurang agresif).
- Hati-hati di link produksi: bandwidth test bisa memenuhi pipa dan
  memengaruhi trafik nyata.

## Torch: intip isi pipa real-time

Torch adalah sniffer mini yang menampilkan trafik per protokol/host dalam
waktu nyata:

```bash
/tool/torch interface=ether1 port=any
```

- Tampilkan per host tujuan (`src-address`/`dst-address`), per protokol
  (TCP/UDP/other), dan volume per detik.
- Alternatif: `/tool/sniffer/quick` untuk capture paket ke file `.pcap` yang
  bisa dibuka di Wireshark.

## Fetch: unduh dari command line

Router bisa mengunduh file dari HTTP/HTTPS/FTP — berguna untuk update skrip
atau konfigurasi dari server pusat:

```bash
/tool/fetch url=https://raw.githubusercontent.com/user/script.rsc \
  dst-path=auto-update.rsc
```

- `dst-path=` — tujuan simpan di storage router.
- Bisa dikombinasikan dengan scheduler untuk update konfigurasi otomatis.
- Juga bisa unggah: `/tool/fetch upload-file=... address=...`

## Sertifikat: HTTPS, VPN, dan DoH

Banyak layanan — DoH, VPN, WebFig HTTPS — butuh sertifikat:

```bash
/certificate/add name=ca common-name="NetSat CA" key-usage=key-cert-sign,crl-sign
/certificate/sign ca ca-crl-host=192.0.2.1

/certificate/add name=router common-name=rtr-kantor-01
/certificate/sign router ca=ca
/certificate/set router trusted=yes
```

- Gunakan CA sendiri untuk VPN internal; untuk DoH, RouterOS sudah pakai CA
  bawaan.
- Cek kedaluwarsa: `/certificate/print where expired`
- Import dari file: `/certificate/import file-name=sertifikat.pem passphrase=...`

## Container: Docker di RouterOS (v7)

RouterOS v7 pada arsitektur ARM64/x86_64 bisa menjalankan container —
berguna untuk menjalankan agent monitoring, DNS ad-blocker, atau tunnel
tambahan:

```bash
/container/config/set registry-url=https://registry-1.docker.io tmpdir=disk1/tmp
/container/add remote-image=adguard/adguardhome:latest interface=bridge1 \
  root-dir=disk1/containers/adguard start-on-boot=yes
```

- `interface=bridge1` — container mendapat IP dari jaringan itu (DHCP atau
  statis).
- Butuh storage ekstra dan RAM yang memadai — tidak semua RouterBOARD
  mendukung.
- Cek `/container/print` — status harus `running`.

## Uji pemahaman

1. Kamu ingin semua router di jaringan dipantau dari satu Zabbix server — apa
   yang harus diaktifkan di tiap router? → SNMP dengan `community` read-only
   yang terbatas ke subnet monitoring.
2. Pelanggan komplain "internet lambat" — alat apa yang langsung memberi
   gambaran trafik real-time per host? → **Torch** (`/tool/torch`).
3. Container di RouterOS tidak mau jalan — dua kemungkinan pertama yang kamu
   periksa? → Arsitektur Routerboard tidak mendukung (MIPS, TILE) atau storage
   tidak mencukupi.
