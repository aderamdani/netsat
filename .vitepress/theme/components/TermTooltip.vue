<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  term: string
  def: string
}>()

const isHovered = ref(false)
</script>

<template>
  <span 
    class="ns-term"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focus="isHovered = true"
    @blur="isHovered = false"
    tabindex="0"
  >
    <span class="ns-term-text">{{ term }}</span>
    <span class="ns-tooltip" :class="{ 'is-visible': isHovered }" role="tooltip">
      <strong>{{ term }}</strong>
      <p>{{ def }}</p>
    </span>
  </span>
</template>

<style scoped>
.ns-term {
  position: relative;
  display: inline-block;
  cursor: help;
  color: var(--ns-gold);
  font-weight: 500;
  border-bottom: 1px dashed var(--ns-gold);
  transition: all 0.2s ease;
}

.ns-term:hover {
  color: var(--ns-gold-strong);
  border-bottom-color: var(--ns-gold-strong);
  background: var(--ns-gold-soft);
  border-radius: 2px;
}

.ns-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  width: max-content;
  max-width: 280px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  text-align: left;
  pointer-events: none;
}

.ns-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: var(--vp-c-bg-elv) transparent transparent transparent;
}

.ns-tooltip::before {
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

.ns-tooltip.is-visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.ns-tooltip strong {
  display: block;
  font-family: var(--ns-font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.ns-tooltip p {
  margin: 0;
}
</style>
