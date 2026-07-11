<script setup lang="ts">
import { ref } from 'vue'
import { Laptop, Split, Server, SatelliteDish, Satellite, Send } from '@lucide/vue'

const isAnimating = ref(false)
const activeStep = ref(-1)
const previousStep = ref(-1)

const steps = [
  { icon: Laptop, name: 'PC', color: '#10b981' },
  { icon: Split, name: 'Switch', color: '#3b82f6' },
  { icon: Server, name: 'MikroTik', color: '#f59e0b' },
  { icon: SatelliteDish, name: 'VSAT', color: '#8b5cf6' },
  { icon: Satellite, name: 'Satelit', color: '#ec4899' },
]

const startTrace = async () => {
  if (isAnimating.value) return
  isAnimating.value = true
  activeStep.value = -1
  previousStep.value = -1
  
  // Uplink
  for (let i = 0; i < steps.length; i++) {
    previousStep.value = activeStep.value
    activeStep.value = i
    await new Promise(r => setTimeout(r, 500))
  }
  
  // Pause at satellite
  await new Promise(r => setTimeout(r, 400))
  
  // Downlink
  for (let i = steps.length - 2; i >= 0; i--) {
    previousStep.value = activeStep.value
    activeStep.value = i
    await new Promise(r => setTimeout(r, 400))
  }
  
  setTimeout(() => {
    activeStep.value = -1
    previousStep.value = -1
    isAnimating.value = false
  }, 1000)
}
</script>

<template>
  <div class="ns-packet-tracer">
    <div class="pt-header">
      <div class="pt-title">
        <h3>Simulasi Packet Tracer</h3>
        <p>Visualisasi aliran paket data dari jaringan lokal ke satelit luar angkasa.</p>
      </div>
      <button class="pt-btn" @click="startTrace" :disabled="isAnimating">
        <Send :size="16" />
        {{ isAnimating ? 'Mengirim...' : 'Kirim Paket' }}
      </button>
    </div>
    
    <div class="pt-topology">
      <div 
        v-for="(step, index) in steps" 
        :key="step.name" 
        class="pt-node-wrapper"
      >
        <div class="pt-node" :class="{ active: activeStep === index }">
          <div class="pt-icon-bg" :style="{ backgroundColor: activeStep === index ? step.color : '' }">
            <component :is="step.icon" :size="28" class="pt-icon" />
          </div>
          <span class="pt-name">{{ step.name }}</span>
        </div>
        
        <!-- Connector line except for last item -->
        <div class="pt-line" v-if="index < steps.length - 1">
          <div 
            class="pt-line-inner" 
            :class="{ 
              'active-forward': (previousStep === index && activeStep === index + 1) || (activeStep > index && activeStep !== -1),
              'active-backward': (previousStep === index + 1 && activeStep === index)
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ns-packet-tracer {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  
  animation: scroll-reveal linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 25%;
}

@keyframes scroll-reveal {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ns-packet-tracer { animation: none; transform: none; }
}

.pt-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 40px;
}
.pt-title h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.pt-title p {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.pt-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.pt-btn:hover:not(:disabled) {
  background: var(--vp-button-brand-hover-bg);
}
.pt-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pt-topology {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  overflow-x: auto;
  padding-bottom: 20px;
}

.pt-node-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}
.pt-node-wrapper:last-child {
  flex: 0;
}

.pt-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 60px;
  flex-shrink: 0;
  transition: transform 0.3s;
}
.pt-node.active {
  transform: translateY(-8px);
}

.pt-icon-bg {
  width: 56px;
  height: 56px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-1);
  transition: all 0.3s;
  box-shadow: inset 0 0 0 1px var(--vp-c-divider);
}
.pt-node.active .pt-icon-bg {
  color: #fff;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.pt-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.3s;
}
.pt-node.active .pt-name {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.pt-line {
  flex: 1;
  height: 2px;
  background: var(--vp-c-divider);
  margin: 0 12px;
  position: relative;
  top: -12px;
  overflow: hidden;
  border-radius: 2px;
}

.pt-line-inner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: var(--ns-gold);
  transform: translateX(-100%);
  transition: transform 0.4s linear;
}

.pt-line-inner.active-forward {
  transform: translateX(0%);
}

.pt-line-inner.active-backward {
  transform: translateX(0%);
  transform-origin: right;
  animation: return-anim 0.4s linear forwards;
}

@keyframes return-anim {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
</style>
