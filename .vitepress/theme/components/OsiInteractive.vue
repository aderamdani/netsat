<script setup lang="ts">
import { ref } from 'vue'
import { Server, Lock, Layers, RefreshCw, Route, Share2, Radio } from '@lucide/vue'

const layers = [
  {
    num: 7,
    name: 'Application',
    icon: Server,
    pdu: 'Data',
    device: 'Aplikasi Host (Browser, Mail Client)',
    proto: 'HTTP, DNS, SMTP, FTP, SSH',
    desc: 'Antarmuka langsung dengan aplikasi. Menyiapkan data yang akan dikirim ke jaringan atau menampilkan data yang diterima dari jaringan.'
  },
  {
    num: 6,
    name: 'Presentation',
    icon: Lock,
    pdu: 'Data',
    device: 'Sistem Operasi / Library',
    proto: 'TLS/SSL, JPEG, ASCII, UTF-8',
    desc: 'Menerjemahkan data antar aplikasi dan format jaringan. Bertanggung jawab atas enkripsi (seperti TLS) dan kompresi data.'
  },
  {
    num: 5,
    name: 'Session',
    icon: Layers,
    pdu: 'Data',
    device: 'Sistem Operasi / API',
    proto: 'NetBIOS, RPC, Sesi TLS',
    desc: 'Membuka, merawat, dan menutup sesi komunikasi antar aplikasi (dialog control). Memastikan aliran data tersinkronisasi.'
  },
  {
    num: 4,
    name: 'Transport',
    icon: RefreshCw,
    pdu: 'Segment / Datagram',
    device: 'Sistem Operasi (Kernel)',
    proto: 'TCP, UDP',
    desc: 'Pengiriman data ujung-ke-ujung (end-to-end) antar proses/aplikasi menggunakan Port. TCP memberikan keandalan, UDP memberikan kecepatan.'
  },
  {
    num: 3,
    name: 'Network',
    icon: Route,
    pdu: 'Packet',
    device: 'Router, L3 Switch',
    proto: 'IPv4, IPv6, ICMP, OSPF, BGP',
    desc: 'Pengalamatan logis (IP Address) dan pemilihan jalur (Routing) untuk mengantarkan paket melintasi jaringan-jaringan yang berbeda.'
  },
  {
    num: 2,
    name: 'Data Link',
    icon: Share2,
    pdu: 'Frame',
    device: 'Switch, Access Point, NIC',
    proto: 'Ethernet, Wi-Fi (802.11), PPP, MAC',
    desc: 'Pengiriman data dalam satu segmen jaringan (medium yang sama). Menggunakan alamat fisik (MAC Address) dan mendeteksi error.'
  },
  {
    num: 1,
    name: 'Physical',
    icon: Radio,
    pdu: 'Bit',
    device: 'Kabel, Hub, Repeater, Modem, Antena',
    proto: '1000BASE-T, Serat Optik, RF Satelit',
    desc: 'Transmisi bit mentah (0 dan 1) melintasi medium fisik berupa sinyal listrik, pulsa cahaya, atau gelombang radio elektromagnetik.'
  }
]

const activeLayer = ref<number | null>(null)

const toggleLayer = (num: number) => {
  if (activeLayer.value === num) {
    activeLayer.value = null
  } else {
    activeLayer.value = num
  }
}
</script>

<template>
  <div class="ns-osi">
    <div class="ns-osi-hint">💡 Klik pada setiap lapisan untuk melihat detail</div>
    <div class="ns-osi-stack">
      <div 
        v-for="layer in layers" 
        :key="layer.num"
        class="ns-osi-layer"
        :class="[
          `layer-${layer.num}`, 
          { 'is-active': activeLayer === layer.num }
        ]"
        @click="toggleLayer(layer.num)"
      >
        <div class="ns-osi-header">
          <div class="ns-osi-num">L{{ layer.num }}</div>
          <div class="ns-osi-icon"><component :is="layer.icon" :size="20" /></div>
          <div class="ns-osi-title">{{ layer.name }}</div>
          <div class="ns-osi-pdu">{{ layer.pdu }}</div>
        </div>
        
        <div class="ns-osi-body" v-show="activeLayer === layer.num">
          <p class="ns-osi-desc">{{ layer.desc }}</p>
          <div class="ns-osi-grid">
            <div class="ns-osi-col">
              <span>Perangkat Utama</span>
              <strong>{{ layer.device }}</strong>
            </div>
            <div class="ns-osi-col">
              <span>Contoh Protokol</span>
              <strong>{{ layer.proto }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ns-osi {
  margin: 32px 0;
  font-family: var(--vp-font-family-base);
}

.ns-osi-hint {
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 16px;
  font-style: italic;
}

.ns-osi-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 680px;
  margin: 0 auto;
}

.ns-osi-layer {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ns-osi-layer:hover {
  border-color: var(--vp-c-brand-1);
}

.ns-osi-layer.is-active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.dark .ns-osi-layer.is-active {
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.ns-osi-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.ns-osi-num {
  font-family: var(--ns-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  width: 32px;
}

.ns-osi-icon {
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  margin-right: 12px;
}

.ns-osi-layer.is-active .ns-osi-icon,
.ns-osi-layer.is-active .ns-osi-num {
  color: var(--vp-c-brand-1);
}

.ns-osi-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ns-osi-pdu {
  font-family: var(--ns-font-mono);
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  padding: 4px 10px;
  border-radius: 12px;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}

.ns-osi-body {
  padding: 0 16px 20px 80px;
  animation: slideDown 0.3s ease;
}

.ns-osi-desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.ns-osi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ns-osi-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ns-osi-col span {
  font-family: var(--ns-font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-3);
}

.ns-osi-col strong {
  font-size: 14px;
  color: var(--vp-c-text-1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 560px) {
  .ns-osi-body {
    padding-left: 16px;
    padding-top: 8px;
  }
  .ns-osi-grid {
    grid-template-columns: 1fr;
  }
  .ns-osi-header {
    flex-wrap: wrap;
  }
  .ns-osi-pdu {
    margin-top: 8px;
    margin-left: 80px;
  }
}
</style>
