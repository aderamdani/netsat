<script setup lang="ts">
import { ref } from 'vue'

const steps = [
  { name: 'Application',  sender: '[Data]',                               receiver: '[Data]' },
  { name: 'Transport',    sender: '[TCP|Data]',                           receiver: '[TCP|Data]' },
  { name: 'Network',      sender: '[IP|TCP|Data]',                        receiver: '[IP|TCP|Data]' },
  { name: 'Data Link',    sender: '[ETH|IP|TCP|Data|FCS]',                receiver: '[ETH|IP|TCP|Data|FCS]' },
  { name: 'Physical',     sender: '101101110101...',                      receiver: '101101110101...' }
]

const currentStep = ref(0)
const isPlaying = ref(false)
const maxSteps = 10 // 0 to 4 (pengirim turun), 5 (medium/transfer), 6 to 10 (penerima naik)

// Timer reference
let timer: ReturnType<typeof setInterval> | null = null

const playSimulation = () => {
  if (isPlaying.value) return
  isPlaying.value = true
  
  if (currentStep.value >= maxSteps) {
    currentStep.value = 0
  }

  timer = setInterval(() => {
    if (currentStep.value < maxSteps) {
      currentStep.value++
    } else {
      stopSimulation()
    }
  }, 1000)
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
  currentStep.value = 0
}

const formatPacket = (text: string, highlightWord: string) => {
  if (!text) return ''
  return text.replace(
    new RegExp(`(${highlightWord})`, 'g'),
    `<span class="highlight">$1</span>`
  )
}
</script>

<template>
  <div class="ns-encap">
    <div class="ns-encap-controls">
      <button class="ns-btn" @click="playSimulation" :disabled="isPlaying || currentStep === maxSteps">
        {{ currentStep === maxSteps ? 'Selesai' : (isPlaying ? 'Berjalan...' : 'Mulai Simulasi') }}
      </button>
      <button class="ns-btn ns-btn-alt" @click="resetSimulation" :disabled="currentStep === 0">
        Ulangi
      </button>
    </div>

    <div class="ns-encap-grid">
      <!-- Sisi Pengirim (Turun) -->
      <div class="ns-side ns-sender">
        <h4 class="ns-side-title">PENGIRIM</h4>
        <div 
          v-for="(step, idx) in steps" 
          :key="'tx-'+idx"
          class="ns-layer"
          :class="{ 'is-active': currentStep === idx, 'is-done': currentStep > idx }"
        >
          <div class="ns-layer-name">{{ step.name }}</div>
          <div class="ns-layer-data" v-html="formatPacket(step.sender, idx === 0 ? 'Data' : (idx === 1 ? 'TCP' : (idx === 2 ? 'IP' : (idx === 3 ? 'ETH|FCS' : '101101'))))"></div>
        </div>
      </div>

      <!-- Medium (Panah Transfer) -->
      <div class="ns-medium">
        <div class="ns-medium-line"></div>
        <div class="ns-medium-arrow" :class="{ 'is-transferring': currentStep >= 4 && currentStep <= 5, 'is-done': currentStep > 5 }">
          ▶
        </div>
        <div class="ns-medium-label">Medium (Kabel/Satelit)</div>
      </div>

      <!-- Sisi Penerima (Naik) -->
      <div class="ns-side ns-receiver">
        <h4 class="ns-side-title">PENERIMA</h4>
        <div 
          v-for="(step, idx) in steps" 
          :key="'rx-'+idx"
          class="ns-layer"
          :class="{ 
            'is-active': currentStep === (10 - idx), 
            'is-done': currentStep > (10 - idx) 
          }"
        >
          <div class="ns-layer-data" v-html="formatPacket(step.receiver, idx === 0 ? 'Data' : (idx === 1 ? 'TCP' : (idx === 2 ? 'IP' : (idx === 3 ? 'ETH|FCS' : '101101'))))"></div>
          <div class="ns-layer-name">{{ step.name }}</div>
        </div>
      </div>
    </div>
    
    <div class="ns-encap-status">
      <template v-if="currentStep === 0"><strong>Aplikasi Pengirim</strong> menghasilkan data.</template>
      <template v-else-if="currentStep === 1"><strong>Transport Pengirim</strong> menambahkan header TCP (Segment).</template>
      <template v-else-if="currentStep === 2"><strong>Network Pengirim</strong> menambahkan header IP (Packet).</template>
      <template v-else-if="currentStep === 3"><strong>Data Link Pengirim</strong> menambah header ETH & trailer FCS (Frame).</template>
      <template v-else-if="currentStep === 4"><strong>Physical Pengirim</strong> mengubah Frame menjadi deretan Bit biner.</template>
      <template v-else-if="currentStep === 5"><strong>Bit ditransmisikan</strong> melalui medium (kabel/satelit) ke tujuan.</template>
      <template v-else-if="currentStep === 6"><strong>Physical Penerima</strong> mendeteksi sinyal dan mengubahnya kembali menjadi Frame.</template>
      <template v-else-if="currentStep === 7"><strong>Data Link Penerima</strong> melepas ETH & FCS, dan menyerahkan Packet ke Network.</template>
      <template v-else-if="currentStep === 8"><strong>Network Penerima</strong> memeriksa tujuan IP, melepas header IP, menyerahkan ke Transport.</template>
      <template v-else-if="currentStep === 9"><strong>Transport Penerima</strong> merangkai urutan TCP, melepas header TCP, menyerahkan ke Aplikasi.</template>
      <template v-else-if="currentStep === 10"><strong>Aplikasi Penerima</strong> berhasil menerima data utuh!</template>
    </div>
  </div>
</template>

<style scoped>
.ns-encap {
  margin: 32px 0;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-family: var(--vp-font-family-base);
}

.ns-encap-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  justify-content: center;
}

.ns-btn {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
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

.ns-encap-grid {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 16px;
  align-items: flex-end;
  position: relative;
}

.ns-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ns-side-title {
  text-align: center;
  font-family: var(--ns-font-mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-2);
  margin: 0 0 16px 0;
}

.ns-layer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.ns-receiver .ns-layer {
  flex-direction: row;
  justify-content: flex-end;
}

.ns-layer.is-active {
  opacity: 1;
  border-color: var(--ns-gold);
  background: var(--ns-gold-soft);
  box-shadow: 0 2px 10px rgba(154, 103, 0, 0.15);
  transform: scale(1.02);
}

.ns-layer.is-done {
  opacity: 0.8;
  border-color: var(--vp-c-divider);
}

.ns-layer-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  width: 80px;
}

.ns-receiver .ns-layer-name {
  text-align: right;
}

.ns-layer.is-active .ns-layer-name {
  color: var(--ns-gold-strong);
}

.ns-layer-data {
  font-family: var(--ns-font-mono);
  font-size: 12px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.ns-layer-data :deep(.highlight) {
  color: var(--ns-gold-strong);
  font-weight: 700;
}

.ns-medium {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
}

.ns-medium-line {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--vp-c-divider) 0, var(--vp-c-divider) 4px, transparent 4px, transparent 8px);
}

.ns-medium-arrow {
  position: absolute;
  bottom: 16px;
  left: 0;
  color: var(--ns-gold);
  font-size: 14px;
  opacity: 0;
  transition: left 1s linear, opacity 0.3s;
}

.ns-medium-arrow.is-transferring {
  opacity: 1;
  left: 80%;
}

.ns-medium-arrow.is-done {
  opacity: 0;
  left: 100%;
}

.ns-medium-label {
  font-family: var(--ns-font-mono);
  font-size: 10px;
  color: var(--vp-c-text-3);
  text-align: center;
  margin-top: auto;
  padding-bottom: 16px;
  white-space: nowrap;
}

.ns-encap-status {
  margin-top: 32px;
  text-align: center;
  padding: 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--ns-gold);
  border-radius: 6px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ns-encap-status strong {
  color: var(--ns-gold-strong);
  margin-right: 6px;
}

@media (max-width: 768px) {
  .ns-encap-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .ns-medium {
    height: 60px;
    padding: 0;
  }

  .ns-medium-arrow {
    bottom: 30px;
    transform: rotate(90deg);
    left: 50% !important;
    margin-left: -5px;
    top: 0;
    transition: top 1s linear, opacity 0.3s;
  }

  .ns-medium-arrow.is-transferring {
    top: 80%;
  }

  .ns-medium-arrow.is-done {
    top: 100%;
  }

  .ns-medium-line {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background: repeating-linear-gradient(180deg, var(--vp-c-divider) 0, var(--vp-c-divider) 4px, transparent 4px, transparent 8px);
  }

  .ns-medium-label {
    display: none;
  }
}
</style>
