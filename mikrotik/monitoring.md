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

## Alat Diagnostik & Cara Membacanya

Ketika jaringan mengalami gangguan, konfigurasi bukanlah hal pertama yang harus diubah. Teknisi yang baik akan melakukan observasi terlebih dahulu menggunakan alat bantu (*diagnostic tools*). Berikut adalah panduan membaca keluaran (*output*) dari empat alat diagnostik utama: **Ping**, **Traceroute**, **ARP**, dan **Torch**.

---

### 1. Ping (ICMP Echo Request/Reply)

Ping adalah langkah pertama untuk menguji keterjangkauan (*reachability*) suatu host di jaringan. Ia mengirimkan paket ICMP Echo Request dan menunggu balasan ICMP Echo Reply.

Sintaks dasar di RouterOS CLI:
```bash
/ping address=8.8.8.8 count=5
```

Contoh keluaran (output) terminal:
```text
  SEQ HOST                                     SIZE TTL TIME  STATUS             
    0 8.8.8.8                                    56  57 18ms  
    1 8.8.8.8                                    56  57 15ms  
    2 8.8.8.8                                    56  57 146ms 
    3 8.8.8.8                                                 timeout            
    4 8.8.8.8                                    56  57 17ms  
    sent=5 received=4 packet-loss=20% min-rtt=15ms avg-rtt=49ms max-rtt=146ms
```

#### Cara Menganalisis Output Ping:
* **TTL (Time to Live):** Nilai batas lompatan (*hop limit*) paket. Setiap kali melewati sebuah router, nilai TTL dikurangi 1. Pada output di atas, `TTL 57` menandakan paket telah melewati beberapa router (biasanya nilai awal TTL adalah 64 atau 128). Jika nilai TTL tiba-tiba berubah secara drastis, ada kemungkinan jalur rute berubah (*routing flap*).
* **TIME (Latency/RTT):** Waktu pulang-pergi paket dalam milidetik (ms).
  * *RTT Rendah & Stabil (10-30ms):* Kondisi jaringan sangat baik (kabel/fiber).
  * *Jitter Tinggi:* Variasi latensi yang drastis (perhatikan baris ke-2 `146ms` vs baris ke-1 `15ms`). *Jitter* tinggi sering disebabkan oleh **kongesti** di mana antrean buffer penuh (*bufferbloat*) atau interferensi nirkabel/satelit.
* **STATUS:**
  * **timeout / Request Timed Out (RTO):** Paket terkirim tetapi tidak ada jawaban. Penyebabnya bisa karena tujuan memblokir ICMP (firewall aktif), atau terjadi kehilangan paket di jalan (*packet loss*) karena jalur penuh.
  * **Destination Host Unreachable:** Router pengirim atau router di tengah jalan tidak memiliki rute (*routing table*) menuju alamat IP tujuan. Ini adalah masalah **routing**, bukan karena host tujuan mati.

---

### 2. Traceroute (Pelacakan Hop Jalur)

Traceroute digunakan untuk memetakan jalur yang dilalui paket dari router kita ke host tujuan dengan memanfaatkan manipulasi nilai TTL secara bertahap (TTL=1, TTL=2, dst).

Sintaks dasar di RouterOS CLI:
```bash
/tool/traceroute address=1.1.1.1
```

Contoh keluaran (output) terminal:
```text
 # ADDRESS                          LOSS SENT LAST     AVG      BEST     WORST
 1 192.168.88.1                     0%   5    0.4ms    0.5ms    0.3ms    0.8ms
 2 10.10.10.1                       0%   5    5.2ms    6.1ms    4.8ms    12ms
 3 *                                100% 5    timeout
 4 203.0.113.5                      0%   5    15.4ms   16.2ms   15.1ms   22ms
 5 1.1.1.1                          0%   5    18.1ms   19.0ms   17.8ms   25ms
```

#### Cara Menganalisis Output Traceroute:
* **Nomor Urut (1, 2, 3...):** Menunjukkan urutan router (*hop*) yang dilewati. Hop 1 biasanya adalah gateway lokal Anda.
* **Kolom LAST, AVG, BEST, WORST:** Menunjukkan latensi pengujian ke hop tersebut. Jika latensi melonjak drastis di salah satau hop (misalnya dari 10ms di hop 3 menjadi 500ms di hop 4), maka bottleneck atau masalah link berada **di antara hop 3 dan hop 4**.
* **Tanda Bintang (`*`) / Timeout di Tengah Jalan:**
  * Seperti pada **hop 3** di atas, jika hanya hop tersebut yang menampilkan tanda bintang namun hop setelahnya (hop 4 dan 5) merespons normal, ini **bukan gangguan jaringan**. Ini menandakan router di hop 3 dikonfigurasi untuk memblokir atau membatasi (*rate-limit*) paket ICMP Time Exceeded demi alasan keamanan.
  * Jika tanda bintang (`*`) muncul dari hop tertentu (misalnya hop 3) **hingga akhir baris seterusnya**, maka jaringan benar-benar terputus atau mengalami rute buntu (*dead end*) mulai dari titik tersebut.

---

### 3. ARP (Address Resolution Protocol)

ARP memetakan alamat IP (Layer 3) ke alamat fisik MAC Address (Layer 2) di dalam satu segmen jaringan lokal (LAN) yang sama. Tanpa ARP, router tidak dapat mengirimkan data fisik ke komputer client.

Sintaks dasar di RouterOS CLI:
```bash
/ip/arp/print
```

Contoh keluaran (output) terminal:
```text
Flags: D - dynamic, S - static, I - invalid, H - DHCP, C - complete 
 #      ADDRESS         MAC-ADDRESS       INTERFACE
 0 D CH 192.168.88.254  AA:BB:CC:DD:EE:11 bridge1
 1 D  C 192.168.88.253  AA:BB:CC:DD:EE:22 bridge1
 2 D  I 192.168.88.252  00:00:00:00:00:00 bridge1
 3  S C 192.168.88.10   AA:BB:CC:DD:EE:99 bridge1
```

#### Cara Menganalisis Flags & Status ARP:
* **D (Dynamic):** Entri dibuat secara otomatis ketika router mendeteksi paket ARP dari client. Entri dynamic memiliki *aging time* (waktu kedaluwarsa) dan akan dihapus otomatis jika client mati/tidak aktif.
* **S (Static):** Entri ditulis secara manual oleh administrator. Entri ini permanen dan tidak akan pernah kedaluwarsa. Sangat penting untuk **keamanan**: mengunci ARP secara statis dapat mencegah serangan pemalsuan identitas jaringan (*ARP Spoofing / Man-In-The-Middle*).
* **I (Invalid / Incomplete):** Router mendeteksi adanya IP tersebut tetapi belum mendapatkan balasan MAC address (terlihat dari MAC-Address yang bernilai nol `00:00:00:00:00:00`).
* **Kasus Troubleshooting ARP:**
  * *Status Invalid/Incomplete:* Perangkat client kemungkinan mati, kabelnya putus, atau terjadi kesalahan konfigurasi subnet mask pada client.
  * *Dua Alamat IP dengan MAC Sama:* Indikasi serangan *ARP Spoofing* di mana ada komputer penyerang yang mengaku sebagai gateway, atau indikasi terjadinya *IP Conflict*.

---

### 4. Torch (MikroTik Real-Time Sniffer)

Torch adalah alat penganalisis (*sniffer*) trafik bawaan MikroTik yang sangat berguna untuk melihat trafik yang sedang melintasi suatu interface secara waktu nyata (*real-time*).

Sintaks dasar di RouterOS CLI:
```bash
/tool/torch interface=ether1 port=any
```

Contoh keluaran (output) terminal:
```text
 MAC-SRC           IP-SRC             IP-DST             PORT  TX-RATE   RX-RATE  
 AA:BB:CC:DD:EE:11 192.168.88.254     203.0.113.10       443   12.5kbps  1.2Mbps
 AA:BB:CC:DD:EE:22 192.168.88.253     8.8.8.8            53    1.2kbps   0.8kbps
 AA:BB:CC:DD:EE:33 192.168.88.120     198.51.100.42      80    2.4Mbps   12.1kbps
```

#### Cara Menganalisis Output Torch:
* **TX-RATE & RX-RATE:** Menunjukkan volume data yang melintasi interface per detik (upload/download dari sudut pandang router).
  * *Mencari Penyedot Bandwidth (Bandwidth Hogger):* Pada contoh di atas, IP `192.168.88.254` menerima data (`RX-RATE`) sebesar `1.2Mbps` pada port `443` (HTTPS/streaming), sedangkan IP `192.168.88.120` mengirim data (`TX-RATE`) sebesar `2.4Mbps` pada port `80` (potensi upload file besar via HTTP).
* **PORT & PROTOCOL:** Membantu mengidentifikasi jenis trafik:
  * Port 80 (HTTP) & Port 443 (HTTPS): Browsing, streaming web.
  * Port 53 (DNS): Kueri domain (biasanya volume pps tinggi, kapasitas bandwidth kecil).
  * Port 22 (SSH) & Port 23 (Telnet): Remote manajemen.
* **Analisis Serangan (DDoS / Scanning):** Jika Anda melihat satu IP sumber luar mengirimkan trafik ke ratusan IP tujuan lokal secara acak dengan `Tx Packet Rate (pps)` sangat tinggi tetapi ukuran data (`TX-RATE` dalam bps) sangat kecil, ini adalah indikasi kuat adanya aktivitas **Port Scanning** atau serangan **DDoS flood**.

---

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

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Kamu ingin semua router di jaringan dipantau dari satu Zabbix server — apa
   yang harus diaktifkan di tiap router? → SNMP dengan `community` read-only
   yang terbatas ke subnet monitoring.
2. Pelanggan komplain "internet lambat" — alat apa yang langsung memberi
   gambaran trafik real-time per host? → **Torch** (`/tool/torch`).
3. Container di RouterOS tidak mau jalan — dua kemungkinan pertama yang kamu
   periksa? → Arsitektur Routerboard tidak mendukung (MIPS, TILE) atau storage
   tidak mencukupi.

</details>