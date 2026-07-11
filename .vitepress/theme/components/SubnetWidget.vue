<script setup lang="ts">
import { ref, computed } from 'vue'
import { Settings2 } from '@lucide/vue'

const cidr = ref(24)

const subnetData = computed(() => {
  const c = cidr.value
  const numSubnets = Math.pow(2, c - 24)
  const totalIpsPerSubnet = Math.pow(2, 32 - c)
  const usableHosts = totalIpsPerSubnet - 2
  
  // Calculate mask
  let maskLastOctet = 0
  for (let i = 0; i < (c - 24); i++) {
    maskLastOctet += Math.pow(2, 7 - i)
  }
  
  return {
    numSubnets,
    usableHosts,
    totalIpsPerSubnet,
    mask: `255.255.255.${maskLastOctet}`
  }
})
</script>

<template>
  <div class="ns-subnet-widget">
    <div class="ns-sw-header">
      <div class="ns-sw-icon"><Settings2 :size="20" /></div>
      <h3>Visualisasi Pemecahan Subnet (192.168.1.0/24)</h3>
    </div>
    
    <div class="ns-sw-controls">
      <div class="slider-group">
        <label for="cidr-slider">Prefix /{{ cidr }}</label>
        <input 
          id="cidr-slider" 
          type="range" 
          v-model.number="cidr" 
          min="24" 
          max="30" 
          step="1"
          class="cidr-range"
        />
      </div>
      <div class="stats-group">
        <div class="stat-box">
          <span class="label">Netmask</span>
          <span class="value">{{ subnetData.mask }}</span>
        </div>
        <div class="stat-box">
          <span class="label">Jumlah Subnet</span>
          <span class="value">{{ subnetData.numSubnets }}</span>
        </div>
        <div class="stat-box">
          <span class="label">Host/Subnet</span>
          <span class="value">{{ subnetData.usableHosts }} <small>host</small></span>
        </div>
      </div>
    </div>
    
    <div class="ns-sw-visual">
      <TransitionGroup name="grid-anim" tag="div" class="subnet-grid" :style="{ '--cols': Math.min(8, subnetData.numSubnets) }">
        <div 
          v-for="i in subnetData.numSubnets" 
          :key="`${cidr}-${i}`" 
          class="subnet-block"
        >
          <div class="block-inner">
            <span v-if="subnetData.numSubnets <= 16">{{ subnetData.usableHosts }} hosts</span>
            <span v-else></span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.ns-subnet-widget {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  
  /* Scroll-driven animation reveal */
  animation: scroll-reveal linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 25%;
}

@keyframes scroll-reveal {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ns-subnet-widget { animation: none; transform: none; }
}

.ns-sw-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.ns-sw-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  color: var(--ns-gold);
}
.ns-sw-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ns-sw-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 640px) {
  .ns-sw-controls {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.slider-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.slider-group label {
  font-family: var(--ns-font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--ns-gold);
}
.cidr-range {
  width: 100%;
  max-width: 300px;
  accent-color: var(--ns-gold);
}

.stats-group {
  display: flex;
  gap: 16px;
}
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-box .label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}
.stat-box .value {
  font-family: var(--ns-font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.stat-box small {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.ns-sw-visual {
  margin-top: 32px;
  background: var(--vp-c-bg-soft);
  padding: 16px;
  border-radius: 8px;
  min-height: 160px;
  display: flex;
  align-items: stretch;
}

.subnet-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 4px;
  width: 100%;
  flex: 1;
}

.subnet-block {
  background: var(--vp-button-brand-bg);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.block-inner {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-button-brand-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

/* Animations for Grid Items */
.grid-anim-enter-active,
.grid-anim-leave-active {
  transition: all 0.4s ease;
}
.grid-anim-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
.grid-anim-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
.grid-anim-move {
  transition: transform 0.4s ease;
}
</style>
