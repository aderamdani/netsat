<script setup lang="ts">
import { ref } from 'vue'

const activeField = ref<string | null>(null)

const headerFields = [
  // Row 1
  { id: 'version', name: 'Version', size: 4, tooltip: '4 bit. Selalu bernilai 4 untuk IPv4.', colSpan: 4 },
  { id: 'ihl', name: 'IHL', size: 4, tooltip: 'Internet Header Length (4 bit). Menunjukkan panjang header IP dalam kelipatan 32 bit (biasanya 5).', colSpan: 4 },
  { id: 'dscp', name: 'DSCP / ECN', size: 8, tooltip: 'Differentiated Services / Explicit Congestion Notification (8 bit). Digunakan untuk QoS dan prioritas trafik.', colSpan: 8 },
  { id: 'length', name: 'Total Length', size: 16, tooltip: '16 bit. Panjang total keseluruhan paket (header + data) dalam satuan byte.', colSpan: 16 },
  
  // Row 2
  { id: 'id', name: 'Identification', size: 16, tooltip: '16 bit. ID unik untuk paket ini, digunakan jika paket perlu difragmentasi.', colSpan: 16 },
  { id: 'flags', name: 'Flags', size: 3, tooltip: '3 bit. Berisi penanda seperti Don\'t Fragment (DF) dan More Fragments (MF).', colSpan: 3 },
  { id: 'offset', name: 'Fragment Offset', size: 13, tooltip: '13 bit. Menunjukkan posisi fragmen ini terhadap paket aslinya.', colSpan: 13 },
  
  // Row 3
  { id: 'ttl', name: 'TTL', size: 8, tooltip: 'Time To Live (8 bit). Berkurang 1 setiap kali melewati router. Jika 0, paket dibuang agar tidak berputar selamanya.', colSpan: 8, highlight: true },
  { id: 'proto', name: 'Protocol', size: 8, tooltip: '8 bit. Menunjukkan protokol di lapisan selanjutnya (misal: 6 = TCP, 17 = UDP, 1 = ICMP).', colSpan: 8, highlight: true },
  { id: 'checksum', name: 'Header Checksum', size: 16, tooltip: '16 bit. Digunakan untuk mendeteksi error korupsi data khusus pada bagian header.', colSpan: 16 },
  
  // Row 4
  { id: 'src', name: 'Source IP Address', size: 32, tooltip: '32 bit. Alamat IP asal pengirim.', colSpan: 32, highlight: true },
  
  // Row 5
  { id: 'dst', name: 'Destination IP Address', size: 32, tooltip: '32 bit. Alamat IP tujuan penerima.', colSpan: 32, highlight: true }
]
</script>

<template>
  <div class="ns-ip-header">
    <div class="ns-hint">💡 Arahkan kursor / klik pada kotak untuk melihat fungsi dan ukuran bit-nya</div>
    
    <div class="ns-header-grid">
      <!-- Bit Ruler -->
      <div class="ns-ruler">
        <div class="ns-ruler-mark" style="left: 0%">0</div>
        <div class="ns-ruler-mark" style="left: 25%">8</div>
        <div class="ns-ruler-mark" style="left: 50%">16</div>
        <div class="ns-ruler-mark" style="left: 75%">24</div>
        <div class="ns-ruler-mark" style="left: 99.5%">31</div>
      </div>

      <!-- Grid container represents 32 bits wide -->
      <div class="ns-grid-container">
        <div 
          v-for="field in headerFields" 
          :key="field.id"
          class="ns-field"
          :class="{ 
            'is-active': activeField === field.id,
            'is-highlighted': field.highlight && !activeField,
            ['col-' + field.colSpan]: true 
          }"
          @mouseenter="activeField = field.id"
          @mouseleave="activeField = null"
          @click="activeField = field.id"
        >
          <span class="ns-field-name">{{ field.name }}</span>
          
          <div class="ns-tooltip-float" v-if="activeField === field.id">
            <strong>{{ field.name }} ({{ field.size }} bit)</strong>
            <p>{{ field.tooltip }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ns-ip-header {
  margin: 32px 0;
  font-family: var(--vp-font-family-base);
}

.ns-hint {
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
  font-style: italic;
}

.ns-header-grid {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.ns-ruler {
  position: relative;
  height: 20px;
  margin-bottom: 4px;
  font-family: var(--ns-font-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
  border-bottom: 1px solid var(--vp-c-divider);
}

.ns-ruler-mark {
  position: absolute;
  transform: translateX(-50%);
  bottom: 4px;
}

.ns-ruler-mark::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 1px;
  height: 4px;
  background: var(--vp-c-divider);
}

.ns-grid-container {
  display: grid;
  grid-template-columns: repeat(32, 1fr);
  gap: 2px;
  background: var(--vp-c-divider);
  border: 2px solid var(--vp-c-divider);
  border-radius: 4px;
}

.ns-field {
  background: var(--vp-c-bg);
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  padding: 4px;
}

.ns-field-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.ns-field.is-highlighted {
  background: var(--vp-c-bg-soft);
  color: var(--ns-gold);
}

.ns-field.is-highlighted .ns-field-name {
  color: var(--ns-gold);
  font-weight: 600;
}

.ns-field:hover, .ns-field.is-active {
  background: var(--ns-gold-soft);
  z-index: 10;
}

.ns-field:hover .ns-field-name, .ns-field.is-active .ns-field-name {
  color: var(--ns-gold-strong);
  font-weight: 700;
}

/* Colspan utilities */
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }
.col-13 { grid-column: span 13; }
.col-16 { grid-column: span 16; }
.col-32 { grid-column: span 32; }

.ns-tooltip-float {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 280px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  text-align: left;
  animation: slide-up 0.2s ease;
}

.ns-tooltip-float::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: var(--vp-c-bg-elv) transparent transparent transparent;
}

.ns-tooltip-float::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -7px;
  border-width: 7px;
  border-style: solid;
  border-color: var(--vp-c-divider) transparent transparent transparent;
  z-index: -1;
}

.ns-tooltip-float strong {
  display: block;
  font-family: var(--ns-font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ns-gold-strong);
  margin-bottom: 6px;
}

.ns-tooltip-float p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  white-space: normal;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 600px) {
  .ns-grid-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: transparent;
    border: none;
  }
  
  .ns-ruler {
    display: none;
  }
  
  .ns-field {
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    height: auto;
    padding: 12px;
  }

  .ns-tooltip-float {
    bottom: auto;
    top: calc(100% + 10px);
  }
  
  .ns-tooltip-float::after {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent var(--vp-c-bg-elv) transparent;
  }
  
  .ns-tooltip-float::before {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent var(--vp-c-divider) transparent;
  }
}
</style>
