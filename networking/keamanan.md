---
title: Keamanan Jaringan
---

# Keamanan Jaringan

Protokol inti internet lahir di lingkungan riset yang saling percaya — ARP
percaya siapa pun yang menjawab, BGP percaya rute yang diumumkan tetangga.
Keamanan jaringan adalah disiplin menambal kepercayaan naif itu: memahami
ancamannya, lalu membangun pertahanan berlapis.

## Tiga pilar: CIA

Semua kontrol keamanan bermuara pada tiga tujuan:

- **Confidentiality** — data hanya terbaca pihak yang berhak → enkripsi.
- **Integrity** — data tidak diubah diam-diam → hash, MAC, tanda tangan digital.
- **Availability** — layanan tetap hidup saat dibutuhkan → redundansi, anti-DDoS.

Tambahan yang sering disebut: **autentikasi** (kamu benar-benar kamu) dan
**non-repudiation** (tidak bisa menyangkal telah mengirim).

::: info Prinsip payung: defense in depth
Tidak ada satu pun kontrol yang sempurna, jadi keamanan disusun **berlapis** —
seperti kastil abad pertengahan: parit, tembok luar, tembok dalam, penjaga di
tiap pintu. Firewall bisa ditembus, maka ada segmentasi; segmentasi bisa
dilewati, maka ada autentikasi; kredensial bisa dicuri, maka ada MFA dan
pemantauan. Pertanyaan desainnya selalu: *"kalau lapisan ini jebol, apa yang
menahan berikutnya?"*
:::

## Peta ancaman per lapisan

Cara berpikir yang rapi: petakan serangan ke
[lapisan OSI](/networking/model-osi) tempat ia bekerja.

| Lapisan | Contoh serangan | Ringkasnya |
| --- | --- | --- |
| L1 Fisik | Penyadapan kabel, jamming radio | Akses fisik = permainan berakhir |
| L2 Data Link | ARP spoofing, MAC flooding, VLAN hopping | Menipu jaringan lokal |
| L3 Network | IP spoofing, ICMP abuse, BGP hijack | Menipu pengalamatan & rute |
| L4 Transport | SYN flood, port scanning | Menyalahgunakan mekanisme koneksi |
| L7 Application | Phishing, injeksi, malware, DNS poisoning | Menyerang manusia & aplikasi |

### Serangan yang wajib dipahami cara kerjanya

**ARP spoofing** — penyerang di LAN yang sama menjawab
[ARP](/networking/switching#arp-jembatan-antara-ip-dan-mac) dengan dusta:
"IP gateway ada di MAC **saya**". Semua trafik korban pun mampir dulu ke
penyerang (*man-in-the-middle*) sebelum diteruskan. Korban tak merasakan apa-apa.

**SYN flood** — penyerang mengirim jutaan SYN
([langkah pertama handshake TCP](/networking/model-tcp-ip#tcp-andal-berurutan-kenal-kemacetan))
tanpa pernah menyelesaikannya, memenuhi tabel koneksi server hingga pengguna
sah ditolak. Klasifikasinya: **DoS** (*denial of service*); versi
terdistribusinya dari ribuan mesin bot disebut **DDoS**.

**DNS cache poisoning** — meracuni cache resolver dengan jawaban palsu,
sehingga `bank.example` diarahkan ke server penyerang. Obat strukturalnya
DNSSEC (tanda tangan digital pada rekaman DNS).

**Phishing** — serangan pada lapisan paling rentan: manusia. Email/situs
palsu yang meniru layanan asli, memancing korban menyerahkan kredensial
sendiri. Varian modernnya makin terarah (*spear phishing* menyasar orang
spesifik dengan konteks yang meyakinkan). Tidak ada firewall yang menolong
kalau penggunanya sendiri yang menyerahkan kata sandi — pertahanannya:
pelatihan, dan **MFA** (*multi-factor authentication*) supaya kata sandi yang
bocor saja belum cukup untuk masuk.

**Serangan kata sandi** — *brute force* (mencoba semua kombinasi) dan
*credential stuffing* (mencoba pasangan email+sandi hasil kebocoran situs
lain). Obatnya: sandi unik per layanan (password manager), MFA, dan
pembatasan percobaan login. Router yang SSH-nya terbuka ke internet menerima
ribuan percobaan per hari — bukan "kalau", tapi "sedang".

## Pertahanan

### Firewall

Penyaring trafik berdasarkan aturan. Evolusinya:

1. **Packet filter** — lihat per paket: IP, port, protokol. Cepat, buta konteks.
2. **Stateful** — mengingat status koneksi; hanya meloloskan balasan dari
   koneksi yang memang dibuka dari dalam. Standar minimum hari ini.
3. **NGFW** (*next-generation*) — mengenali aplikasi dan pengguna, inspeksi
   sampai L7, terintegrasi IPS.

Prinsip emas konfigurasinya: **default deny** — tolak semuanya, lalu buka
hanya yang dibutuhkan.

Sketsa kebijakan khas sebuah server web:

| Aksi | Trafik | Alasan |
| --- | --- | --- |
| **allow** | `tcp/443` dari mana saja | Layanan publik (HTTPS) |
| **allow** | `tcp/22` dari IP kantor saja | Pintu admin dibatasi |
| **deny** | Semua lainnya | Default deny |

### IDS/IPS

- **IDS** (*Intrusion Detection System*) — mengamati trafik, membunyikan alarm
  saat melihat pola serangan. Pasif.
- **IPS** (*Intrusion Prevention System*) — duduk di jalur trafik dan langsung
  memblokir. Aktif.

Deteksinya berbasis *signature* (pola serangan yang dikenal) dan/atau anomali
(penyimpangan dari perilaku normal).

### VPN: terowongan terenkripsi

VPN membungkus trafik dalam terowongan terenkripsi melewati jaringan yang tak
dipercaya:

- **Site-to-site** (IPsec) — menyambungkan dua kantor seolah satu LAN.
- **Remote access** (WireGuard, OpenVPN) — laptop pekerja remote "masuk" ke
  jaringan kantor dari mana pun.

::: warning VPN di atas link satelit
Enkripsi VPN menyembunyikan header TCP dari *PEP/TCP accelerator* yang biasa
dipakai operator [VSAT](/satelit/vsat#pep-dan-akselerasi-tcp) untuk mengakali
[latensi GEO](/satelit/komunikasi#dampak-latensi-pada-tcp) — akibatnya VPN di
atas GEO sering terasa jauh lebih lambat dari kapasitas link-nya. Praktik
umumnya: pilih VPN berbasis UDP, atau biarkan operator menerapkan enkripsi di
lapisan link.
:::

### Segmentasi dan Zero Trust

Jangan biarkan jaringan internal menjadi satu kolam besar: pisahkan dengan
[VLAN](/networking/switching#vlan-banyak-jaringan-di-satu-switch) dan firewall
internal (server, karyawan, tamu, CCTV/IoT), sehingga penyerang yang menembus
satu segmen tidak otomatis menguasai semuanya.

Kelanjutan logisnya adalah **Zero Trust**: tidak ada yang dipercaya karena
"sudah di dalam" — setiap akses diverifikasi ulang (identitas, perangkat,
konteks), *least privilege* diberlakukan di mana-mana.

### Kriptografi dalam dua paragraf

**Simetris** (AES): satu kunci untuk enkripsi dan dekripsi — cepat, dipakai
untuk data massal. **Asimetris** (RSA, ECC): sepasang kunci publik-privat —
lambat, dipakai untuk bertukar kunci simetris dan tanda tangan digital.
TLS memakai keduanya: asimetris saat handshake, simetris setelahnya.

**Hash** (SHA-256): sidik jari data satu arah; ubah satu bit, hash berubah
total. Dasar integritas, penyimpanan kata sandi, dan tanda tangan.

### Keamanan infrastruktur routing

Level internet: **RPKI** memberi bukti kriptografis bahwa sebuah AS memang
berhak mengumumkan sebuah prefix, menutup celah
[BGP hijack](/networking/routing#bgp-routing-antar-negara); *route filtering*
antar-ISP menahan kebocoran rute sebelum menyebar.

## Keamanan komunikasi satelit

Sinyal [downlink satelit](/satelit/komunikasi) menyirami area seluas benua —
siapa pun dengan antena bisa menangkapnya. Karena itu:

- Trafik satelit modern **wajib terenkripsi** end-to-end (riset berulang kali
  menemukan trafik VSAT lawas yang telanjang dan bisa disadap dengan peralatan
  murah).
- Kanal **TT&C** (telemetry, tracking & command) satelit diamankan ekstra —
  siapa yang menguasainya, menguasai satelitnya.
- Jamming dan spoofing GNSS adalah ancaman nyata; penerima kritis memakai
  antena terarah dan pemantauan integritas sinyal.

## Kebersihan dasar (baseline)

Daftar minimum untuk jaringan apa pun, dari lab sekolah sampai kantor:

1. Ganti semua kata sandi bawaan perangkat; pakai kata sandi unik + MFA.
2. Perbarui firmware/patch secara rutin.
3. Matikan layanan/port yang tidak dipakai (kecilkan *attack surface*).
4. Firewall default deny + segmentasi VLAN.
5. Enkripsi di mana-mana: HTTPS, WPA3, VPN untuk akses remote.
6. Backup teruji (offline/immutable) — pertahanan terakhir terhadap ransomware.
7. Catat dan pantau (logging + NTP yang akur, supaya log bisa dipercaya).

## Cek pemahaman

<details>
<summary>Lihat jawaban</summary>


1. Enkripsi HTTPS melindungi pilar CIA yang mana? <br>→ **Confidentiality**
   dan **integrity** (plus autentikasi server lewat sertifikat). Ia *tidak*
   menolong availability.
2. Korban ARP spoofing membuka situs ber-HTTPS. Apa yang bisa dan tidak bisa
   dilihat penyerang? <br>→ Bisa: ke mana korban terhubung (IP/nama situs),
   kapan, seberapa banyak. Tidak bisa: **isi** trafiknya — TLS tetap
   mengunci. Lapisan pertahanan bekerja walau satu lapis jebol.
3. Kenapa firewall stateful lebih aman daripada packet filter murni? <br>→ Ia
   hanya meloloskan balasan dari koneksi yang **memang dibuka dari dalam** —
   paket masuk yang tidak diundang otomatis tertolak tanpa perlu aturan
   khusus.
4. Kantormu memisahkan VLAN karyawan, tamu, dan CCTV. Serangan apa yang
   dilemahkan desain ini? <br>→ *Lateral movement*: penyerang yang menguasai
   satu segmen (mis. kamera CCTV murah yang tak pernah di-update) tidak
   otomatis bisa menjangkau komputer karyawan.

---

**Praktik:** firewall default-deny, address-list dinamis, dan VPN dari halaman
ini dibangun di [Firewall & QoS](/mikrotik/firewall-qos) dan
[VPN (MikroTik)](/mikrotik/vpn).

Modul networking selesai. Sekarang saatnya meninggalkan permukaan bumi:
[Pengantar Satelit](/satelit/) menunggu di modul berikutnya.

</details>