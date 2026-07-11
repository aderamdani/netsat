---
title: Glosari
---

# Glosari

Istilah dan singkatan yang muncul di modul ini, dirangkum dalam satu tempat.

## A

**ACM** — *Adaptive Coding and Modulation*. Teknik modem satelit yang menyesuaikan
skema modulasi dan FEC secara real-time mengikuti kondisi link. Lihat
[Modulasi & Coding](/satelit/komunikasi#modulasi-dan-coding).

**Address-list** — Kumpulan alamat bernama di RouterOS yang bisa diisi manual
maupun otomatis, dipakai sebagai bahan baku aturan firewall dinamis. Lihat
[Address-list](/mikrotik/firewall-qos#address-list-firewall-yang-menulis-dirinya-sendiri).

**ARP** — *Address Resolution Protocol*. Protokol layer 2/3 yang memetakan alamat
IP ke alamat MAC. Lihat [ARP](/networking/switching#arp-jembatan-antara-ip-dan-mac).

**AS** — *Autonomous System*. Blok jaringan yang dikelola oleh satu entitas
(ISP, perusahaan besar) dengan kebijakan routing sendiri. Lihat
[BGP](/networking/routing#bgp-routing-antar-negara).

## B

**Bandwidth** — Kapasitas maksimal pipa komunikasi dalam bit per detik (bps).
Beda dengan throughput. Lihat [Tiga ukuran kinerja](/networking/#tiga-ukuran-kinerja-yang-wajib-dipahami).

**BGP** — *Border Gateway Protocol*. Protokol routing antar-AS, tulang punggung
internet. Lihat [BGP](/mikrotik/routing#bgp).

**Bonding** — Penggabungan beberapa interface Ethernet menjadi satu link logis
untuk redundansi dan/atau agregasi bandwidth. Lihat
[Bonding](/mikrotik/bridging-switching#bonding-gabung-bandwidth-lipat-ketahanan).

**Bridge** — Switch virtual di dalam RouterOS. Menghubungkan beberapa port pada
layer 2. Lihat [Bridge](/mikrotik/bridging-switching#bridge-switch-virtual-di-dalam-router).

**Burst** — Mekanisme queue yang mengizinkan kecepatan melebihi `max-limit`
untuk sementara waktu selama rata-rata pemakaian di bawah `burst-threshold`.
Lihat [Burst](/mikrotik/firewall-qos#burst-kecepatan-ekstra-di-awal).

## C

**CAPsMAN** — *Controlled Access Point system MANager*. Fitur manajemen terpusat
untuk access point Wi-Fi di RouterOS. Lihat
[CAPsMAN](/mikrotik/wireless-dan-satelit#capsman-sekilas).

**CGNAT** — *Carrier-Grade NAT*. NAT berlapis di sisi ISP, membuat pelanggan
berbagi IP publik dengan ribuan pengguna lain. Menyulitkan koneksi masuk.
Lihat [NAT](/networking/subnetting#alamat-khusus-yang-wajib-hafal).

**CHR** — *Cloud Hosted Router*. RouterOS yang berjalan sebagai mesin virtual
(VirtualBox, Proxmox, VMware, AWS). Lihat
[Menyiapkan lab CHR](/mikrotik/#menyiapkan-lab-chr-dalam-lima-langkah).

**CIDR** — *Classless Inter-Domain Routing*. Notasi prefix panjang seperti
`/24` yang menggantikan class A/B/C. Lihat
[Notasi CIDR](/networking/subnetting#notasi-cidr-dan-subnet-mask).

**CIR** — *Committed Information Rate*. Bandwidth minimum yang dijamin dalam
layanan — kebalikan dari *best effort*. Lihat
[Merancang layanan](/satelit/vsat#merancang-layanan-parameter-yang-diperjualbelikan).

**Connection tracking** — Tabel stateful yang mencatat setiap koneksi yang
melewati router. Jantung firewall stateful RouterOS. Lihat
[Connection tracking](/mikrotik/firewall-qos#connection-tracking-ingatan-firewall).

**Cost** — Metrik OSPF yang menentukan preferensi jalur. Makin kecil cost,
makin menarik jalurnya. Lihat [OSPF](/mikrotik/routing#ospf).

## D

**DDNS** — *Dynamic DNS*. Layanan yang memetakan nama domain tetap ke alamat
IP dinamis. Lihat [DDNS](/mikrotik/dhcp-dns-nat#ddns-ip-dinamis-nama-tetap).

**Default deny** — Prinsip firewall: semua ditolak kecuali yang diizinkan
secara eksplisit. Lihat [Firewall](/networking/keamanan#firewall).

**Default route** — Rute `0.0.0.0/0` yang mencocokkan semua tujuan. Jaring
pengaman ketika tidak ada rute spesifik. Lihat
[Rute statis](/mikrotik/routing#rute-statis-dan-default-route).

**DHCP** — *Dynamic Host Configuration Protocol*. Protokol yang membagikan
alamat IP dan konfigurasi jaringan secara otomatis. Lihat
[DHCP](/networking/protokol#dhcp).

**Distance** — Nilai preferensi rute di RouterOS. Makin kecil, makin diutamakan.
Juga disebut *administrative distance*. Lihat
[Failover](/mikrotik/routing#failover-dua-wan-distance-check-gateway).

**DNS** — *Domain Name System*. Menerjemahkan nama (seperti `netsat.aderamdani.web.id`)
ke alamat IP. Lihat [DNS](/networking/protokol#dns).

**DoH** — *DNS over HTTPS*. Enkripsi query DNS lewat protokol HTTPS untuk
mencegah penyadapan. Lihat [DoH](/mikrotik/dhcp-dns-nat#dns-over-https-privasi-di-tingkat-dns).

**DSCP** — *Differentiated Services Code Point*. Markah di header IP untuk
memberi prioritas QoS ujung-ke-ujung. Lihat
[DSCP](/mikrotik/firewall-qos#dscp-menandai-paket-untuk-qos-upstream).

**dst-nat** — *Destination NAT*. Aturan NAT yang mengubah alamat tujuan —
digunakan untuk port forwarding. Lihat
[dst-nat](/mikrotik/dhcp-dns-nat#dst-nat-membuka-layanan-ke-dalam-port-forward).

## E

**ECMP** — *Equal-Cost Multi-Path*. Dua atau lebih gateway dengan distance yang
sama dipakai bergantian per koneksi untuk menyeimbangkan beban. Lihat
[ECMP](/mikrotik/routing#ecmp-dua-jalur-satu-tujuan).

**EIRP** — *Effective Isotropic Radiated Power*. Daya pancar efektif antena
dalam dBW — gabungan daya pemancar, penguatan antena, dan rugi kabel.
Lihat [Link budget](/satelit/komunikasi#link-budget-akuntansi-desibel).

**EoIP** — *Ethernet over IP*. Tunnel layer 2 RouterOS yang membungkus frame
Ethernet di dalam paket IP. Lihat [VPN](/mikrotik/vpn).

## F

**FastTrack** — Fitur yang melompati pemrosesan firewall/mangle/queue untuk
koneksi yang sudah dipercaya, meningkatkan throughput. Lihat
[FastTrack](/mikrotik/firewall-qos#mangle-dan-fasttrack).

**FEC** — *Forward Error Correction*. Bit redundansi yang dikirim bersama data
agar penerima bisa memperbaiki error tanpa minta kirim ulang. Krusial di link
satelit. Lihat [Modulasi & Coding](/satelit/komunikasi#modulasi-dan-coding).

**FSPL** — *Free-Space Path Loss*. Rugi lintasan sinyal radio di ruang hampa
— komponen terbesar dalam neraca daya komunikasi satelit.
Lihat [Link budget](/satelit/komunikasi#link-budget-akuntansi-desibel).

## G

**Gateway** — Router yang menjadi pintu keluar dari suatu jaringan ke jaringan
lain. Lihat [Istilah dasar](/networking/#istilah-dasar-yang-akan-terus-muncul).

**GEO** — *Geostationary Earth Orbit*. Orbit 35.786 km di atas ekuator; satelit
tampak diam dari bumi. Lihat [GEO](/satelit/orbit#geo-geostationary-orbit).

## H

**Hairpin NAT** — Fenomena di mana klien di LAN tidak bisa mengakses layanan
yang di-port-forward ke IP publik router dari dalam jaringan lokal. Lihat
[Hairpin NAT](/mikrotik/dhcp-dns-nat#hairpin-nat-membuka-lubang-untuk-diri-sendiri).

**Hardware offload** — Pemrosesan switch/bridging langsung oleh chip
hardware, bukan oleh CPU. Ditandai kolom `HW` di RouterOS. Lihat
[Hardware offload](/mikrotik/bridging-switching#hardware-offload-switch-beneran-bukan-cpu).

**HTS** — *High-Throughput Satellite*. Satelit dengan banyak *spot beam* yang
memungkinkan frekuensi sama dipakai ulang di wilayah berbeda — kapasitas
jauh lebih besar dari *broadcast beam* konvensional.

## I

**IKEv2** — *Internet Key Exchange version 2*. Protokol pertukaran kunci untuk
IPsec, mendukung mobilitas klien (MoBIKE). Lihat
[IKEv2/IPsec](/mikrotik/vpn#ikev2-ipsec-alternatif-standar-terbuka).

**Interface** — "Pintu" logis atau fisik sebuah perangkat ke jaringan. Di
RouterOS, interface adalah segalanya: ethernet, bridge, vlan, wifi, tunnel.
Lihat [Mengenal interface](/mikrotik/interface-ip#mengenal-interface).

**Interface list** — Kumpulan interface bernama untuk aturan firewall/NAT/QoS
yang tak perlu diubah saat topologi berubah. Lihat
[Interface lists](/mikrotik/firewall-qos#interface-lists-aturan-yang-tak-perlu-diubah-saat-topologi-berubah).

**IPsec** — *IP Security*. Kerangka protokol untuk mengenkripsi dan
mengotentikasi trafik IP. Lihat [IPsec](/mikrotik/vpn#ipsec-dan-l2tp-ipsec-peta-singkat).

## L

**L2TP** — *Layer 2 Tunneling Protocol*. Protokol tunnel yang sering
dikombinasikan dengan IPsec untuk VPN remote access.
Lihat [IPsec & L2TP](/mikrotik/vpn#ipsec-dan-l2tp-ipsec-peta-singkat).

**LACP** — *Link Aggregation Control Protocol*. Protokol standar (802.3ad)
untuk bonding. Lihat [Bonding](/mikrotik/bridging-switching#bonding-gabung-bandwidth-lipat-ketahanan).

**Latensi** — Waktu tempuh data dari sumber ke tujuan, diukur dalam
milidetik. Di satelit GEO RTT ±500 ms. Lihat
[Tiga ukuran kinerja](/networking/#tiga-ukuran-kinerja-yang-wajib-dipahami).

**LEO** — *Low Earth Orbit*. Orbit 200–2.000 km. Latensi rendah (RTT
±20–40 ms), tapi satelit bergerak cepat dan butuh konstelasi banyak unit.
Lihat [LEO](/satelit/orbit#leo-low-earth-orbit).

**Lisensi level** — Tingkat fitur RouterOS (L1–L6, CHR p1/p10/p-unlimited).
Level bukan kecepatan, melainkan kapasitas fitur. Lihat
[Lisensi level](/mikrotik/#lisensi-level).

**LNB** — *Low-Noise Block downconverter*. Komponen di feed antena parabola
yang menguatkan dan menurunkan frekuensi sinyal satelit ke L-band.
Lihat [Rantai sinyal](/satelit/ground-station#rantai-sinyal).

**Longest prefix match** — Prinsip pemilihan rute: prefix paling spesifik
(terpanjang) menang. Lihat
[Longest prefix match](/networking/routing#longest-prefix-match).

## M

**MAC address** — *Media Access Control address*. Alamat fisik 48-bit yang
melekat pada setiap antarmuka jaringan, ditulis heksadesimal
(`AA:BB:CC:DD:EE:FF`). Lihat [Alamat MAC](/networking/switching#alamat-mac).

**MAC-telnet** — Akses CLI RouterOS lewat layer 2 menggunakan alamat MAC,
tanpa perlu IP. Lihat [Lima pintu masuk](/mikrotik/akses-awal#lima-pintu-masuk).

**Mangle** — Fitur firewall RouterOS yang menandai paket/koneksi tanpa
menghakimi — tanda dipakai komponen lain (queue, routing policy). Lihat
[Mangle](/mikrotik/firewall-qos#mangle-dan-fasttrack).

**Masquerade** — Jenis NAT (src-nat) yang secara dinamis mengganti IP sumber
dengan alamat interface keluar. Cocok untuk IP WAN dinamis. Lihat
[Masquerade](/mikrotik/dhcp-dns-nat#masquerade-seisi-lan-menumpang-satu-ip-publik).

**MEO** — *Medium Earth Orbit*. Orbit 2.000–35.786 km. Kompromi antara
latensi dan cakupan. Lihat [MEO](/satelit/orbit#meo-medium-earth-orbit).

**MF-TDMA** — *Multi-Frequency Time Division Multiple Access*. Teknik
berbagi transponder di VSAT: tiap terminal remote mendapat jatah frekuensi
dan slot waktu tertentu. Lihat
[VSAT](/satelit/vsat#mf-tdma-berbagi-transponder).

**MSS** — *Maximum Segment Size*. Ukuran maksimum segmen TCP, biasanya
MTU dikurangi header. Klamping MSS penting untuk VPN di atas link satelit.
Lihat [VPN & satelit](/mikrotik/vpn#vpn-di-atas-link-satelit).

## N

**NAT** — *Network Address Translation*. Menerjemahkan alamat IP privat ke
publik (src-nat) atau sebaliknya (dst-nat). Lihat
[NAT](/mikrotik/dhcp-dns-nat#nat).

**Neighbor discovery** — Protokol RouterOS untuk menemukan perangkat MikroTik
lain di segmen layer 2 yang sama. Lihat
[Ritual WinBox](/mikrotik/akses-awal#ritual-pertama-di-winbox).

**Netinstall** — Utilitas untuk menginstal atau memulihkan RouterOS dari
komputer, biasanya saat firmware rusak (*bricked*).

**NTP** — *Network Time Protocol*. Menjaga jam router tetap akurat. Penting
untuk log, sertifikat, dan troubleshooting. Lihat
[NTP](/mikrotik/manajemen#ntp-jam-yang-akurat).

## O

**OSI** — *Open Systems Interconnection*. Model 7 lapisan untuk menjelaskan
komunikasi jaringan. Lihat [Model OSI](/networking/model-osi).

**OSPF** — *Open Shortest Path First*. Protokol routing dinamis *link-state*
yang menemukan jalur terpendek dalam satu AS. Lihat
[OSPF](/mikrotik/routing#ospf).

## P

**Packet** — Satuan data di layer jaringan (L3). Potongan data + header
alamat yang berpindah-pindah di jaringan. Lihat
[Perangkat jaringan](/networking/#perangkat-jaringan).

**PCQ** — *Per Connection Queue*. Algoritma antrean yang membagi bandwidth
secara adil per alamat/port. Lihat
[Queue tree](/mikrotik/firewall-qos#queue-tree-pcq-sekilas).

**PEP** — *Performance Enhancing Proxy*. Proxy TCP di modem VSAT yang
menjawab handshake secara lokal untuk mengakali latensi GEO. Lihat
[PEP](/satelit/vsat#pep-dan-akselerasi-tcp).

**Policy routing** — Pengalihan rute berdasarkan kriteria seperti alamat
asal, protokol, atau port — bukan hanya alamat tujuan. Lihat
[Policy routing](/mikrotik/routing#policy-routing-aturan-rute-berdasarkan-asal).

**PPPoE** — *Point-to-Point Protocol over Ethernet*. Protokol koneksi yang
memakai kredensial username/password — sangat umum di ISP Indonesia. Lihat
[PPPoE](/mikrotik/pppoe).

**Prefix** — Bagian jaringan dari alamat IP, ditulis setelah garis miring
(mis. `/24`). Lihat [CIDR](/networking/subnetting#notasi-cidr-dan-subnet-mask).

## Q

**QoS** — *Quality of Service*. Pengaturan prioritas dan bandwidth agar
trafik penting (VoIP, video call) tetap lancar saat pipa penuh. Lihat
[QoS](/mikrotik/firewall-qos#qos-membagi-pipa-yang-terbatas).

**Queue** — Struktur antrean paket yang mengatur urutan pengiriman dan
kecepatan. Simple queue, queue tree, PCQ. Lihat
[QoS](/mikrotik/firewall-qos#qos-membagi-pipa-yang-terbatas).

## R

**Redaman hujan** — Pelemahan sinyal gelombang mikro oleh tetesan hujan.
Masalah utama frekuensi tinggi (Ku, Ka) di iklim tropis. Lihat
[Redaman hujan](/satelit/frekuensi-band#redaman-hujan-isu-nomor-satu-di-indonesia).

**Route** — Entri di tabel routing yang memberi tahu router ke mana
mengirim paket untuk suatu tujuan. Lihat
[Tabel routing](/mikrotik/routing#membaca-tabel-routing).

**RouterBOARD** — Perangkat keras fisik buatan MikroTik yang menjalankan
RouterOS. Lihat [RouterOS & RouterBOARD](/mikrotik/#routeros-dan-routerboard).

**RouterOS** — Sistem operasi jaringan berbasis Linux buatan MikroTik. Lihat
[Pengantar RouterOS](/mikrotik/).

**RTT** — *Round-Trip Time*. Waktu pergi-pulang satu paket dari sumber ke
tujuan dan kembali. Di satelit GEO: ±500 ms. Lihat
[Latensi](/satelit/komunikasi#latensi-per-orbit).

## S

**Safe Mode** — Mode di mana perubahan konfigurasi bersifat sementara;
jika koneksi terputus, semua perubahan otomatis dibatalkan. Lihat
[Safe Mode](/mikrotik/manajemen#tata-bahasa-cli).

**Scheduler** — Penjadwal tugas periodik di RouterOS. Bisa menjalankan
skrip, backup, atau perintah pada waktu/interval tertentu. Lihat
[Skrip & penjadwalan](/mikrotik/manajemen#skrip-dan-penjadwalan).

**Simple queue** — Metode QoS paling sederhana: batasi bandwidth per
target (IP, subnet, interface). Lihat
[Simple queue](/mikrotik/firewall-qos#simple-queue).

**SNMP** — *Simple Network Management Protocol*. Protokol untuk memantau
perangkat jaringan dari sistem monitoring (Zabbix, LibreNMS). Lihat
[SNMP](/mikrotik/monitoring#snmp-jendela-bagi-sistem-monitoring).

**src-nat** — *Source NAT*. Aturan NAT yang mengubah alamat asal paket
keluar. Masquerade adalah varian dinamisnya. Lihat
[NAT](/mikrotik/dhcp-dns-nat#nat).

**STP** — *Spanning Tree Protocol*. Protokol yang mencegah loop di
jaringan switch dengan menonaktifkan port redundan secara otomatis.
Lihat [STP](/mikrotik/bridging-switching#stp-dan-loop-protect).

**Subnet** — Pembagian logis dari satu blok alamat IP menjadi beberapa
segmen yang lebih kecil. Lihat
[Subnetting](/networking/subnetting).

## T

**TCP** — *Transmission Control Protocol*. Protokol transport yang andal,
berurutan, dengan kendali kemacetan. Lihat
[TCP](/networking/model-tcp-ip#tcp-andal-berurutan-kenal-kemacetan).

**Throughput** — Kecepatan data nyata yang berhasil dikirim, berbeda dari
bandwidth teoritis. Lihat
[Tiga ukuran kinerja](/networking/#tiga-ukuran-kinerja-yang-wajib-dipahami).

**Torch** — Alat diagnostik real-time RouterOS untuk melihat trafik per
host/protokol pada suatu interface. Lihat
[Torch](/mikrotik/monitoring#_4-torch-mikrotik-real-time-sniffer).

**Transponder** — Perangkat di satelit yang menerima sinyal uplink,
menggeser frekuensinya, menguatkan, dan memancarkan kembali ke bumi.
Lihat [Anatomi satelit](/satelit/#anatomi-satelit-komunikasi).

**Trunk** — Port switch yang membawa banyak VLAN sekaligus, berbeda dengan
*access port* yang hanya satu VLAN. Lihat
[Trunk & tagging](/networking/switching#trunk-dan-tagging-802-1q).

**TTL** — *Time To Live*. Nilai di header IP yang berkurang 1 setiap
melewati router; mencapai 0 → paket dibuang. Mencegah paket berputar
selamanya. Lihat [Anatomi IP](/networking/model-tcp-ip#anatomi-header-ipv4).

## U

**UDP** — *User Datagram Protocol*. Protokol transport tanpa koneksi —
cepat, tapi tanpa jaminan pengiriman. Lihat
[UDP](/networking/model-tcp-ip#udp-kirim-dan-lupakan).

## V

**VLAN** — *Virtual LAN*. Membagi satu switch fisik menjadi beberapa
jaringan logis yang terisolasi di layer 2. Lihat
[VLAN](/networking/switching#vlan-banyak-jaringan-di-satu-switch).

**VLSM** — *Variable Length Subnet Mask*. Teknik subnetting dengan prefix
yang berbeda-beda dalam satu blok alamat — efisien karena tiap subnet
hanya sebesar kebutuhannya. Lihat
[VLSM](/networking/subnetting#vlsm-subnet-dengan-ukuran-berbeda-beda).

**VPN** — *Virtual Private Network*. Terowongan terenkripsi antar-jaringan
lewat internet publik. Lihat [VPN](/mikrotik/vpn).

**VRF** — *Virtual Routing and Forwarding*. Mempartisi tabel routing
sehingga satu router bisa memiliki beberapa tabel routing yang terisolasi.
Lihat [Policy routing](/mikrotik/routing#policy-routing-aturan-rute-berdasarkan-asal).

**VSAT** — *Very Small Aperture Terminal*. Terminal satelit dengan antena
parabola kecil (< 2,4 m) untuk komunikasi data dua arah. Lihat
[VSAT](/satelit/vsat).

## W

**WebFig** — Antarmuka web RouterOS. Alternatif WinBox tanpa aplikasi
desktop. Lihat [WinBox vs WebFig vs CLI](/mikrotik/manajemen#winbox-vs-webfig-vs-cli).

**WinBox** — Aplikasi desktop manajemen RouterOS. Bisa mengakses perangkat
lewat IP maupun MAC address. Lihat
[WinBox vs WebFig vs CLI](/mikrotik/manajemen#winbox-vs-webfig-vs-cli).

**WireGuard** — Protokol VPN modern dengan kriptografi minimalis, performa
tinggi, dan konfigurasi sederhana. Lihat
[WireGuard](/mikrotik/vpn#wireguard-site-to-site).
