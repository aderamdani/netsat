<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  mode: 'handshake' | 'recovery'
}>()

const isPlaying = ref(false)
const currentStep = ref(-1)

// Handshake Mode Data
const handshakeSteps = [
  { type: 'klien_to_server', text: 'SYN (seq=x)', desc: 'Klien meminta membuka koneksi baru.', success: true },
  { type: 'server_to_klien', text: 'SYN-ACK (seq=y, ack=x+1)', desc: 'Server setuju, membalas SYN dan mengakui SYN klien.', success: true },
  { type: 'klien_to_server', text: 'ACK (ack=y+1)', desc: 'Klien mengakui SYN server. Koneksi Terbentuk!', success: true }
]

// Recovery Mode Data
const recoverySteps = [
  { type: 'klien_to_server', text: 'Data: seq=1..1000', desc: 'Klien mengirim 1000 byte pertama.', success: true },
  { type: 'server_to_klien', text: 'ACK: 1001', desc: 'Server membalas: "sudah kuterima s.d. byte 1000".', success: true },
  { type: 'klien_to_server', text: 'Data: seq=1001..2000', desc: 'Klien mengirim 1000 byte berikutnya.', success: false, dropped: true },
  { type: 'klien_to_server', text: 'Data: seq=2001..3000', desc: 'Klien mengirim 1000 byte lagi (tanpa tahu data sebelumnya hilang).', success: true },
  { type: 'server_to_klien', text: 'ACK: 1001', desc: 'Server menyadari ada lubang. Balas: "aku masih menunggu byte 1001".', success: true, highlight: true },
  { type: 'klien_to_server', text: 'Data: seq=1001..2000', desc: 'Klien menyadari paket hilang. Kirim ulang seq=1001..2000. Aliran pulih!', success: true, retransmit: true }
]

const steps = computed(() => props.mode === 'handshake' ? handshakeSteps : recoverySteps)

let timer: ReturnType<typeof setInterval> | null = null

const playSimulation = () => {
  if (isPlaying.value) return
  isPlaying.value = true
  
  if (currentStep.value >= steps.value.length - 1) {
    currentStep.value = -1
  }

  timer = setInterval(() => {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++
    } else {
      stopSimulation()
    }
  }, 1500)
}

const stopSimulation = () => {
  isPlaying.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetSimulation = () => {
  stopSimulation()
  currentStep.value = -1
}
</script>

<template>
  <div class="ns-tcp-demo">
    <div class="ns-tcp-header">
      <h4>{{ mode === 'handshake' ? 'Three-Way Handshake' : 'Packet Loss & Retransmission' }}</h4>
      <div class="ns-tcp-controls">
        <button class="ns-btn" @click="playSimulation" :disabled="isPlaying || currentStep === steps.length - 1">
          {{ currentStep === steps.length - 1 ? 'Selesai' : (isPlaying ? 'Berjalan...' : 'Mulai Simulasi') }}
        </button>
        <button class="ns-btn ns-btn-alt" @click="resetSimulation" :disabled="currentStep === -1">
          Ulangi
        </button>
      </div>
    </div>

    <div class="ns-tcp-stage">
      <div class="ns-tcp-labels">
        <div class="ns-tcp-label">KLIEN</div>
        <div class="ns-tcp-label">SERVER</div>
      </div>
      
      <div class="ns-tcp-lines">
        <div class="ns-tcp-line ns-line-left"></div>
        <div class="ns-tcp-line ns-line-right"></div>

        <div class="ns-tcp-timeline">
          <div 
            v-for="(step, idx) in steps" 
            :key="idx" 
            class="ns-tcp-packet-row"
            :class="{ 'is-visible': currentStep >= idx }"
          >
            <!-- Label Info di Kiri (jika Klien ke Server) -->
            <div class="ns-tcp-info ns-info-left" v-if="step.type === 'klien_to_server'">
              <p class="ns-info-desc">{{ step.desc }}</p>
            </div>
            
            <!-- Area Panah Tengah -->
            <div class="ns-tcp-arrow-area">
              <div 
                class="ns-packet-arrow"
                :class="[
                  step.type === 'klien_to_server' ? 'arrow-right' : 'arrow-left',
                  { 'is-dropped': step.dropped, 'is-highlight': step.highlight, 'is-retransmit': step.retransmit, 'animate-now': currentStep === idx }
                ]"
              >
                <span class="ns-packet-text">{{ step.text }}</span>
                <div class="ns-packet-line"></div>
                <div class="ns-packet-head"></div>
                <div v-if="step.dropped" class="ns-packet-cross">❌ (Hilang)</div>
              </div>
            </div>

            <!-- Label Info di Kanan (jika Server ke Klien) -->
            <div class="ns-tcp-info ns-info-right" v-if="step.type === 'server_to_klien'">
              <p class="ns-info-desc">{{ step.desc }}</p>
            </div>
          </div>

          <div class="ns-tcp-success" v-if="currentStep === steps.length - 1">
            <span v-if="mode === 'handshake'">✅ Koneksi Terbentuk!</span>
            <span v-else>✅ Aliran Data Pulih!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ns-tcp-demo {
  margin: 32px 0;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-family: var(--vp-font-family-base);
}

.ns-tcp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ns-tcp-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ns-tcp-controls {
  display: flex;
  gap: 12px;
}

.ns-btn {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.ns-btn:hover:not(:disabled) {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
}

.ns-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ns-btn-alt {
  background: transparent;
  color: var(--vp-c-text-2);
  border-color: var(--vp-c-divider);
}

.ns-btn-alt:hover:not(:disabled) {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  border-color: var(--ns-gold);
}

.ns-tcp-stage {
  padding: 0 20px;
}

.ns-tcp-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ns-tcp-label {
  font-family: var(--ns-font-mono);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 8px 24px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  z-index: 2;
}

.ns-tcp-lines {
  position: relative;
  min-height: 200px;
}

.ns-tcp-line {
  position: absolute;
  top: -16px;
  bottom: -40px;
  width: 2px;
  background: var(--vp-c-divider);
  z-index: 1;
}

.ns-line-left { left: 40px; }
.ns-line-right { right: 40px; }

.ns-tcp-timeline {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 16px;
  position: relative;
  z-index: 2;
}

.ns-tcp-packet-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  min-height: 24px;
  opacity: 0;
  transition: opacity 0.3s;
}

.ns-tcp-packet-row.is-visible {
  opacity: 1;
}

.ns-tcp-info {
  font-size: 12px;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  padding: 0 16px;
}

.ns-info-left { text-align: right; }
.ns-info-right { text-align: left; }

.ns-info-desc { margin: 0; }

.ns-tcp-arrow-area {
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
}

.ns-packet-arrow {
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
}

.ns-packet-text {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--ns-font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  padding: 0 8px;
  white-space: nowrap;
}

.ns-packet-line {
  flex: 1;
  height: 2px;
  background: var(--ns-gold);
}

.ns-packet-head {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.arrow-right .ns-packet-head {
  border-left: 8px solid var(--ns-gold);
}

.arrow-left .ns-packet-line { order: 2; }
.arrow-left .ns-packet-head {
  order: 1;
  border-right: 8px solid var(--ns-gold);
  border-left: none;
}

/* Animations */
.arrow-right.animate-now {
  animation: slide-right 1s ease-in-out forwards;
}

.arrow-left.animate-now {
  animation: slide-left 1s ease-in-out forwards;
}

.arrow-right.is-dropped.animate-now {
  animation: slide-drop 1s ease-in-out forwards;
}

.arrow-right.is-dropped:not(.animate-now) {
  width: 60%;
  opacity: 0.5;
}

.is-dropped .ns-packet-line, .is-dropped .ns-packet-head {
  background: #ef4444;
  border-left-color: #ef4444;
}

.ns-packet-cross {
  position: absolute;
  right: -20px;
  top: -8px;
  font-size: 12px;
  color: #ef4444;
  font-weight: bold;
}

.is-highlight .ns-packet-text {
  color: #ef4444;
  font-weight: 700;
}
.is-highlight .ns-packet-line, .is-highlight .ns-packet-head {
  background: #ef4444;
  border-right-color: #ef4444;
}

.is-retransmit .ns-packet-text {
  color: #10b981;
}
.is-retransmit .ns-packet-line, .is-retransmit .ns-packet-head {
  background: #10b981;
  border-left-color: #10b981;
}

.ns-tcp-success {
  text-align: center;
  font-weight: 600;
  color: #10b981;
  margin-top: 16px;
  padding: 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  animation: fade-in 0.5s ease;
}

@keyframes slide-right {
  0% { width: 0%; opacity: 0; }
  10% { opacity: 1; }
  100% { width: 100%; opacity: 1; }
}

@keyframes slide-left {
  0% { width: 0%; opacity: 0; left: 100%; }
  10% { opacity: 1; }
  100% { width: 100%; opacity: 1; left: 0; }
}

@keyframes slide-drop {
  0% { width: 0%; opacity: 0; }
  10% { opacity: 1; }
  100% { width: 60%; opacity: 0.5; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 680px) {
  .ns-tcp-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .ns-tcp-packet-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .ns-tcp-info {
    text-align: center !important;
    padding: 0;
  }
  
  .ns-info-left { order: -1; }
  .ns-info-right { order: 2; }
  
  .ns-tcp-arrow-area {
    margin: 16px 0;
  }
}
</style>
