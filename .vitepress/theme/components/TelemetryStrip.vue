<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const activeConnections = ref(1420)
const signalStrength = ref(92)
const pingValue = ref('-- ms')
const isPinging = ref(false)

let intervalId: number

onMounted(() => {
  intervalId = window.setInterval(() => {
    // Fluktuasi ringan
    activeConnections.value += Math.floor(Math.random() * 5) - 2
    if (Math.random() > 0.7) {
      signalStrength.value = Math.min(100, Math.max(70, signalStrength.value + (Math.floor(Math.random() * 5) - 2)))
    }
  }, 2000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

const testPing = async () => {
  if (isPinging.value) return
  isPinging.value = true
  
  // Simulate LEO ping
  pingValue.value = 'mengukur...'
  await new Promise(r => setTimeout(r, 600))
  pingValue.value = 'LEO: 38 ms'
  
  await new Promise(r => setTimeout(r, 1500))
  pingValue.value = 'mengukur GEO...'
  
  // Simulate GEO ping
  await new Promise(r => setTimeout(r, 800))
  pingValue.value = 'GEO: 580 ms'
  
  setTimeout(() => {
    isPinging.value = false
    pingValue.value = '-- ms'
  }, 3000)
}
</script>

<template>
  <section class="ns-telemetry" aria-label="Angka-angka kunci">
    <div class="ns-telemetry-inner">
      <dl class="ns-telemetry-row">
        <div class="ns-readout">
          <dt>LAPISAN OSI</dt>
          <dd>7</dd>
        </div>
        <div class="ns-readout">
          <dt>ALAMAT IPv4</dt>
          <dd>2³²</dd>
        </div>
        <div class="ns-readout live-data">
          <dt>KONEKSI AKTIF <span class="blink">●</span></dt>
          <dd>{{ activeConnections.toLocaleString('id-ID') }}</dd>
        </div>
        <div class="ns-readout live-data">
          <dt>SIGNAL STRENGTH</dt>
          <dd>{{ signalStrength }}%</dd>
        </div>
        <div class="ns-readout">
          <dt>LIVE PING</dt>
          <dd class="ping-display">{{ pingValue }}</dd>
        </div>
      </dl>
      <button 
        class="ns-btn-ping" 
        @click="testPing" 
        :disabled="isPinging"
      >
        {{ isPinging ? 'Menguji...' : 'Test Ping' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.ns-telemetry {
  margin: 36px 0 8px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 18px 0;
}

.ns-telemetry-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.ns-telemetry-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 40px;
  margin: 0;
  flex: 1;
}

.ns-readout dt {
  font-family: var(--ns-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--vp-c-text-3);
}

.ns-readout dd {
  margin: 3px 0 0;
  font-family: var(--ns-font-mono);
  font-size: 15px;
  font-weight: 500;
  color: var(--ns-gold);
  font-variant-numeric: tabular-nums;
}

.live-data dt {
  color: var(--vp-c-text-2);
}
.blink {
  color: var(--vp-c-green-2, #10b981);
  animation: blink 2s infinite;
  display: inline-block;
  margin-left: 2px;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ns-btn-ping {
  background: transparent;
  border: 1px solid var(--ns-gold);
  color: var(--ns-gold);
  padding: 8px 14px;
  border-radius: 6px;
  font-family: var(--ns-font-mono);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ns-btn-ping:hover:not(:disabled) {
  background: var(--ns-gold-soft);
}

.ns-btn-ping:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

.ping-display {
  min-width: 110px;
}
</style>
